<?php

namespace Tests\Feature;

use App\Models\Divipola;
use App\Models\Predio;
use App\Models\Productor;
use App\Models\RegistroRuea;
use App\Models\User;
use App\Servicios\ServicioRuea;
use App\Support\Ruea\PreguntasRuea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistroRueaTest extends TestCase
{
    use RefreshDatabase;

    public function test_consulta_productor_existente_retorna_exclusivamente_sus_predios(): void
    {
        $usuario = User::factory()->create();
        [$productor, $predio] = $this->productorConPredio('RUEA-001');
        $otroProductor = Productor::query()->create([
            'nombres' => 'Otro', 'apellidos' => 'Productor', 'tipo_documento' => 'Pasaporte', 'numero_documento' => 'RUEA-002',
        ]);
        Predio::query()->create(['productor' => $otroProductor->getKey(), 'nombre' => 'Predio ajeno', 'divipola' => $predio->getRawOriginal('divipola')]);

        $respuesta = $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?tipo_documento=Cédula+de+ciudadanía&numero_documento=RUEA-001');

        $respuesta->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.productor', $productor->getKey())
            ->assertJsonCount(1, '0.predios')
            ->assertJsonPath('0.predios.0.predio', $predio->getKey());
    }

    public function test_productor_inexistente_no_se_crea_desde_ruea(): void
    {
        $usuario = User::factory()->create();

        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?tipo_documento=Cédula+de+ciudadanía&numero_documento=NO-EXISTE')
            ->assertOk()
            ->assertExactJson([]);
        $this->assertDatabaseCount('productores', 0);
        $this->assertDatabaseCount('predios', 0);
    }

    public function test_rechaza_un_predio_que_no_pertenece_al_productor(): void
    {
        $usuario = User::factory()->create();
        [$productor] = $this->productorConPredio('RUEA-003');
        [, $predioAjeno] = $this->productorConPredio('RUEA-004');

        $this->actingAs($usuario)->post('/registro-ruea/borrador', [
            'productor' => $productor->getKey(),
            'predio' => $predioAjeno->getKey(),
        ])->assertSessionHasErrors('predio');

        $this->assertDatabaseCount('registros_ruea', 0);
    }

    public function test_borrador_incompleto_se_guarda_se_reabre_y_no_crea_productores_ni_predios(): void
    {
        $usuario = User::factory()->create();

        $this->actingAs($usuario)->post('/registro-ruea/borrador', [
            'observaciones' => 'Pendiente de diligenciar',
            'respuestas' => ['S1_P01' => 2],
        ])->assertRedirect()
            ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Borrador RUEA guardado correctamente. Puedes continuar diligenciándolo posteriormente']);

        $registro = RegistroRuea::query()->firstOrFail();
        $this->assertDatabaseHas('registros_ruea', ['registro_ruea' => $registro->getKey(), 'estado' => 'borrador', 'productor' => null, 'predio' => null]);
        $this->assertDatabaseHas('respuestas_ruea', ['registro_ruea' => $registro->getKey(), 'campo' => 'S1_P01', 'valor' => 2]);
        $this->assertDatabaseCount('productores', 0);
        $this->assertDatabaseCount('predios', 0);

        $this->actingAs($usuario)->get('/registro-ruea/'.$registro->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('registro.id', $registro->getKey())
            ->where('registro.estado', 'borrador')
            ->where('registro.respuestas.S1_P01', '2'));
    }

    public function test_actualiza_respuestas_sin_duplicarlas(): void
    {
        $usuario = User::factory()->create();
        [$productor, $predio] = $this->productorConPredio('RUEA-005');
        $datos = $this->datos($productor, $predio, ['S1_P01' => 1]);

        $this->actingAs($usuario)->post('/registro-ruea/borrador', $datos)->assertRedirect();
        $registro = RegistroRuea::query()->firstOrFail();

        $this->actingAs($usuario)->put('/registro-ruea/'.$registro->getKey().'/borrador', [...$datos, 'respuestas' => ['S1_P01' => 4]])->assertRedirect();

        $this->assertDatabaseCount('respuestas_ruea', 30);
        $this->assertDatabaseHas('respuestas_ruea', ['registro_ruea' => $registro->getKey(), 'campo' => 'S1_P01', 'valor' => 4]);
    }

    public function test_rechaza_respuestas_invalidas_y_codigos_desconocidos(): void
    {
        $usuario = User::factory()->create();

        $this->actingAs($usuario)->post('/registro-ruea/borrador', ['respuestas' => ['S1_P01' => 5]])
            ->assertSessionHasErrors('respuestas.S1_P01');
        $this->actingAs($usuario)->post('/registro-ruea/borrador', ['respuestas' => ['S9_P99' => 1]])
            ->assertSessionHasErrors('respuestas.S9_P99');
        $this->assertDatabaseCount('registros_ruea', 0);
    }

    public function test_un_fallo_tecnico_conserva_la_solicitud_y_publica_error_en_sonner(): void
    {
        $usuario = User::factory()->create();
        $this->mock(ServicioRuea::class, function ($mock): void {
            $mock->shouldReceive('guardar')->once()->andThrow(new \RuntimeException('detalle técnico no público'));
        });

        $this->actingAs($usuario)->post('/registro-ruea/borrador', ['observaciones' => 'Texto diligenciado'])
            ->assertRedirect()
            ->assertSessionHas('_old_input.observaciones', 'Texto diligenciado')
            ->assertInertiaFlash('toast', [
                'type' => 'error',
                'message' => 'No fue posible guardar el RUEA. Revisa los errores indicados e inténtalo nuevamente',
            ]);
    }

    public function test_registra_las_treinta_preguntas_y_establece_fecha_de_finalizacion(): void
    {
        $usuario = User::factory()->create();
        [$productor, $predio] = $this->productorConPredio('RUEA-006');
        $datos = $this->datos($productor, $predio);

        $this->actingAs($usuario)->post('/registro-ruea', $datos)->assertRedirect('/registro-ruea')
            ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'RUEA guardado correctamente. La información fue registrada satisfactoriamente']);

        $registro = RegistroRuea::query()->firstOrFail();
        $this->assertSame('registrado', $registro->estado);
        $this->assertNotNull($registro->fecha_finalizacion);
        $this->assertDatabaseCount('respuestas_ruea', 30);
        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);
    }

    public function test_registro_definitivo_exige_productor_predio_extensionista_y_todas_las_respuestas(): void
    {
        $usuario = User::factory()->create();

        $this->actingAs($usuario)->post('/registro-ruea', [
            'nombre_extensionista' => 'Funcionario',
            'numero_documento_extensionista' => '123',
            'perfil_extensionista' => 'Profesional',
            'respuestas' => ['S1_P01' => 1],
        ])->assertSessionHasErrors(['productor', 'predio', 'respuestas']);

        $this->assertDatabaseCount('registros_ruea', 0);
    }

    public function test_edita_un_ruea_conservando_su_identificador_y_audita_el_cambio(): void
    {
        $usuario = User::factory()->create();
        [$productor, $predio] = $this->productorConPredio('RUEA-007');
        $datos = $this->datos($productor, $predio);
        $this->actingAs($usuario)->post('/registro-ruea', $datos)->assertRedirect();
        $registro = RegistroRuea::query()->firstOrFail();

        $respuestas = $datos['respuestas'];
        $respuestas['S1_P01'] = 4;
        $this->actingAs($usuario)->put('/registro-ruea/'.$registro->getKey(), [...$datos, 'respuestas' => $respuestas, 'observaciones' => 'Actualizado'])->assertRedirect('/registro-ruea');

        $this->assertDatabaseCount('registros_ruea', 1);
        $this->assertDatabaseHas('respuestas_ruea', ['registro_ruea' => $registro->getKey(), 'campo' => 'S1_P01', 'valor' => 4]);
        $this->assertDatabaseHas('versiones_auditoria', ['entidad' => 'registro_ruea', 'registro' => $registro->getKey()]);
        $this->assertDatabaseHas('cambios_auditoria', ['campo' => 'respuesta.S1_P01', 'valor_anterior' => '1', 'valor_nuevo' => '4']);

        $respuestaListado = $this->actingAs($usuario)->get('/registro-ruea');
        $historial = $respuestaListado->inertiaProps('historialTrazabilidad.'.$registro->getKey());

        $this->assertSame('Pregunta: '.PreguntasRuea::ETIQUETAS['S1_P01'], collect($historial[0]['cambios'])->firstWhere('campo', 'respuesta.S1_P01')['etiqueta']);
        $this->assertSame('4', collect($historial[0]['cambios'])->firstWhere('campo', 'respuesta.S1_P01')['nuevo']);

        $respuestaListado->assertInertia(fn (Assert $page) => $page
            ->where('registros.0.numero', (string) $registro->getKey())
            ->where('registros.0.estado', 'Registrado'));
    }

    public function test_esquema_ruea_no_agrega_visita_ni_timestamps_a_respuestas(): void
    {
        $this->assertFalse(Schema::hasColumn('registros_ruea', 'visita_extensionismo'));
        $this->assertFalse(Schema::hasColumn('respuestas_ruea', 'created_at'));
        $this->assertFalse(Schema::hasColumn('respuestas_ruea', 'updated_at'));
        $this->assertTrue(Schema::hasColumn('registros_ruea', 'created_at'));
        $this->assertTrue(Schema::hasColumn('registros_ruea', 'updated_at'));
    }

    public function test_edicion_precarga_hectareas_reales_del_predio(): void
    {
        $usuario = User::factory()->create();
        [$productor, $predio] = $this->productorConPredio('RUEA-008');
        $datos = $this->datos($productor, $predio);

        $this->actingAs($usuario)->post('/registro-ruea', $datos)->assertRedirect();
        $registro = RegistroRuea::query()->firstOrFail();

        $this->actingAs($usuario)->get('/registro-ruea/'.$registro->getKey().'/editar')
            ->assertInertia(fn (Assert $page) => $page
                ->where('registro.predio.predio', $predio->getKey())
                ->where('registro.predio.hectareas', '2.50')
                ->where('registro.predio.divipola', $predio->getRawOriginal('divipola')));
    }

    public function test_si_el_predio_no_tiene_hectareas_usa_el_area_historica_de_la_visita(): void
    {
        $usuario = User::factory()->create();
        [$productor, $predio] = $this->productorConPredio('RUEA-009');
        $predio->update(['hectareas' => null]);
        DB::table('visitas_extensionismo')->insert([
            'productor' => $productor->getKey(),
            'predio' => $predio->getKey(),
            'area_hectareas' => 3.75,
            'estado' => 'registrado',
            'usuario' => $usuario->getKey(),
        ]);
        $datos = $this->datos($productor, $predio);

        $this->actingAs($usuario)->post('/registro-ruea', $datos)->assertRedirect();
        $registro = RegistroRuea::query()->firstOrFail();

        $this->actingAs($usuario)->get('/registro-ruea/'.$registro->getKey().'/editar')
            ->assertInertia(fn (Assert $page) => $page->where('registro.predio.hectareas', '3.750000'));
    }

    /** @return array{0: Productor, 1: Predio} */
    private function productorConPredio(string $documento): array
    {
        $productor = Productor::query()->create([
            'nombres' => 'Productor RUEA', 'apellidos' => $documento, 'tipo_documento' => 'Cédula de ciudadanía', 'numero_documento' => $documento,
        ]);
        $divipola = Divipola::query()->firstOrFail();
        $predio = Predio::query()->create([
            'productor' => $productor->getKey(), 'nombre' => 'Predio RUEA '.$documento,
            'divipola' => $divipola->getKey(), 'hectareas' => 2.5,
        ]);

        return [$productor, $predio];
    }

    /** @param array<string, int> $respuestas */
    private function datos(Productor $productor, Predio $predio, array $respuestas = []): array
    {
        return [
            'productor' => $productor->getKey(),
            'predio' => $predio->getKey(),
            'observaciones' => 'Observaciones RUEA',
            'nombre_extensionista' => 'Funcionario RUEA',
            'numero_documento_extensionista' => 'EXT-001',
            'perfil_extensionista' => 'Profesional agropecuario',
            'respuestas' => $respuestas + array_fill_keys(PreguntasRuea::codigos(), 1),
        ];
    }
}
