<?php

namespace Tests\Feature;

use App\Models\Divipola;
use App\Models\EnfoquePoblacional;
use App\Models\EspecieProductiva;
use App\Models\LineaProductiva;
use App\Models\Predio;
use App\Models\User;
use App\Models\VisitaExtensionismo;
use App\Servicios\ServicioAuditoria;
use App\Servicios\ServicioVisitasExtensionismo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VisitaExtensionismoTest extends TestCase
{
    use RefreshDatabase;

    public function test_guarda_y_actualiza_la_misma_visita_con_productor_y_predio_reales(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $servicio = app(ServicioVisitasExtensionismo::class);

        $visita = $servicio->guardar($datos, $usuario->id, true);
        $servicio->guardar([...$datos, 'diagnostico' => 'Diagnóstico actualizado', 'productor_existente' => $visita->productor, 'predio_existente' => $visita->predio], $usuario->id, true, $visita);

        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);
        $this->assertDatabaseCount('visitas_extensionismo', 1);
        $this->assertDatabaseCount('visitas_borradores', 0);
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visita->getKey(), 'diagnostico' => 'Diagnóstico actualizado', 'estado' => 'registrado']);
        $this->assertDatabaseHas('visitas_enfoques_poblacionales', ['visita_extensionismo' => $visita->getKey(), 'enfoque_poblacional' => $enfoque->getKey()]);
        $this->assertDatabaseHas('cambios_auditoria', ['campo' => 'diagnostico', 'valor_nuevo' => 'Diagnóstico actualizado']);
    }

    public function test_borrador_no_crea_productor_ni_predio_y_se_actualiza_en_el_mismo_registro(): void
    {
        $usuario = User::factory()->create();
        $servicio = app(ServicioVisitasExtensionismo::class);
        $borrador = $servicio->guardar(['nombres' => 'Ana', 'apellidos' => 'Rural', 'telefono' => '3001234567', 'nombre_predio' => 'El Porvenir', 'diagnostico' => 'Parcial', 'victima_conflicto_armado' => 'S'], $usuario->id, false);
        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$borrador->getKey().'/borrador', ['diagnostico' => 'Corregido'])->assertRedirect('/visitas-extensionismo/'.$borrador->getKey().'/editar');

        $this->assertDatabaseCount('productores', 0);
        $this->assertDatabaseCount('predios', 0);
        $this->assertDatabaseCount('visitas_extensionismo', 1);
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $borrador->getKey(), 'estado' => 'borrador', 'diagnostico' => 'Corregido', 'victima_conflicto_armado' => 'S']);
        $this->assertDatabaseHas('visitas_borradores', ['visita_extensionismo' => $borrador->getKey(), 'nombres_productor' => 'Ana', 'apellidos_productor' => 'Rural', 'telefono_productor' => '3001234567', 'nombre_predio' => 'El Porvenir']);
        $this->assertDatabaseHas('cambios_auditoria', ['campo' => 'borrador.nombres_productor', 'valor_nuevo' => 'Ana']);
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$borrador->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('visita.nombres', 'Ana')
            ->where('visita.apellidos', 'Rural')
            ->where('visita.telefono', '3001234567')
            ->where('visita.nombre_predio', 'El Porvenir'));
    }

    public function test_borrador_con_productor_nuevo_se_finaliza_sin_crear_definitivos_antes_de_confirmar(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = [...$this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()), 'numero_documento' => '987654'];

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', $datos)->assertRedirect();
        $borrador = VisitaExtensionismo::query()->firstOrFail();

        $this->assertDatabaseCount('productores', 0);
        $this->assertDatabaseCount('predios', 0);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(), 'estado' => 'borrador', 'productor' => null, 'predio' => null,
        ]);
        $this->assertDatabaseHas('visitas_borradores', [
            'visita_extensionismo' => $borrador->getKey(), 'numero_documento' => '987654', 'nombre_predio' => 'El Porvenir',
        ]);

        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$borrador->getKey(), $datos)->assertRedirect('/visitas-extensionismo');

        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(), 'estado' => 'registrado',
        ]);
        $this->assertDatabaseMissing('visitas_borradores', ['visita_extensionismo' => $borrador->getKey()]);
    }

    public function test_borrador_con_productor_y_predio_existentes_conserva_las_relaciones_y_no_duplica(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $servicio = app(ServicioVisitasExtensionismo::class);
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $registrada = $servicio->guardar($datos, $usuario->id, true);
        $datosBorrador = [...$datos, 'productor_existente' => $registrada->productor, 'predio_existente' => $registrada->predio];

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', $datosBorrador)->assertRedirect();
        $borrador = VisitaExtensionismo::query()->where('estado', 'borrador')->firstOrFail();

        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(), 'productor' => $registrada->productor, 'predio' => $registrada->predio,
        ]);
        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);

        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$borrador->getKey(), $datosBorrador)->assertRedirect('/visitas-extensionismo');

        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(), 'estado' => 'registrado', 'productor' => $registrada->productor, 'predio' => $registrada->predio,
        ]);
    }

    public function test_error_al_finalizar_borrador_revierte_productor_predio_y_conserva_fotografia(): void
    {
        Storage::fake('local');
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $servicio = app(ServicioVisitasExtensionismo::class);
        $registrada = $servicio->guardar($this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()), $usuario->id, true);
        $datosBorrador = [
            ...$this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()),
            'numero_documento' => '987654',
            'fotografias' => [UploadedFile::fake()->image('borrador.jpg')],
        ];

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', $datosBorrador)->assertRedirect();
        $borrador = VisitaExtensionismo::query()->where('estado', 'borrador')->firstOrFail();
        $ruta = (string) DB::table('archivos')->value('ruta');

        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$borrador->getKey(), [
            ...$datosBorrador,
            'predio_existente' => $registrada->predio,
        ])->assertStatus(302);

        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(), 'estado' => 'borrador', 'productor' => null, 'predio' => null,
        ]);
        $this->assertDatabaseHas('visitas_borradores', ['visita_extensionismo' => $borrador->getKey(), 'numero_documento' => '987654']);
        $this->assertDatabaseCount('archivos', 1);
        $this->assertDatabaseCount('anexos', 1);
        Storage::disk('local')->assertExists($ruta);
    }

    public function test_guarda_los_campos_de_si_no_como_s_y_n(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()),
            'victima_conflicto_armado' => '1',
            'sisben' => 'No',
            'asociacion' => 'Sí',
        ])->assertRedirect('/visitas-extensionismo');

        $visita = VisitaExtensionismo::query()->firstOrFail()->fresh();

        $this->assertSame('S', $visita->victima_conflicto_armado);
        $this->assertSame('N', $visita->afiliado_sisben);
        $this->assertSame('S', $visita->afiliado_asociacion);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $visita->getKey(),
            'victima_conflicto_armado' => 'S',
            'afiliado_sisben' => 'N',
            'afiliado_asociacion' => 'S',
        ]);
    }

    public function test_trazabilidad_de_enfoques_muestra_nombres_y_conserva_identificadores_historicos_no_disponibles(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoques = EnfoquePoblacional::query()->orderBy('enfoque_poblacional')->take(2)->get();
        $primero = $enfoques->firstOrFail();
        $segundo = $enfoques->last();
        $this->assertNotNull($segundo);
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $primero->getKey());
        $servicio = app(ServicioVisitasExtensionismo::class);
        $visita = $servicio->guardar($datos, $usuario->id, true);

        $servicio->guardar([
            ...$datos,
            'productor_existente' => $visita->productor,
            'predio_existente' => $visita->predio,
            'enfoques_poblacionales' => [$segundo->getKey()],
        ], $usuario->id, true, $visita);
        app(ServicioAuditoria::class)->registrar('visita_extensionismo', $visita->getKey(), 'Cambio histórico', $usuario->id, [
            'enfoques_poblacionales' => ['anterior' => [$segundo->getKey()], 'nuevo' => [999999]],
        ]);

        $this->actingAs($usuario)->get('/visitas-extensionismo')->assertInertia(fn (Assert $page) => $page
            ->where('historialTrazabilidad.'.$visita->getKey().'.0.cambios.0.anterior', $segundo->nombre)
            ->where('historialTrazabilidad.'.$visita->getKey().'.0.cambios.0.nuevo', 'Enfoque no disponible')
            ->where('historialTrazabilidad.'.$visita->getKey().'.1.cambios.0.anterior', $primero->nombre)
            ->where('historialTrazabilidad.'.$visita->getKey().'.1.cambios.0.nuevo', $segundo->nombre));

        $this->assertDatabaseHas('cambios_auditoria', [
            'campo' => 'enfoques_poblacionales', 'valor_anterior' => (string) $primero->getKey(), 'valor_nuevo' => (string) $segundo->getKey(),
        ]);
    }

    public function test_borrador_persiste_campos_operativos_y_ubicacion_temporal_y_los_recupera_al_editar(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->where('codigo_departamento', '85')->firstOrFail();
        $corregimiento = DB::table('corregimientos')->where('divipola', $divipola->getKey())->firstOrFail();
        $vereda = DB::table('veredas')->where('corregimiento', $corregimiento->corregimiento)->firstOrFail();
        $lineaAgricola = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $lineaPecuaria = LineaProductiva::query()->where('codigo', 'PECUARIO')->firstOrFail();
        $platano = EspecieProductiva::query()->where('codigo', 'MI10_PLATANO')->firstOrFail();

        $borrador = app(ServicioVisitasExtensionismo::class)->guardar([
            'nombres' => 'Borrador', 'apellidos' => 'Completo', 'tipo_documento' => 'Cédula de ciudadanía',
            'numero_documento' => '20261113', 'telefono' => '3001234567', 'sexo' => 'Femenino',
            'nombre_predio' => 'Predio temporal', 'divipola' => $divipola->getKey(),
            'corregimiento' => $corregimiento->corregimiento, 'vereda' => $vereda->vereda,
            'latitud' => 5.332694, 'longitud' => -72.390294,
            'linea_productiva_principal' => $lineaAgricola->getKey(),
            'especie_productiva' => $platano->getKey(),
            'linea_productiva_secundaria' => $lineaPecuaria->getKey(),
            'area_hectareas' => 3, 'unidad_area_ingresada' => 'hectareas',
            'numero_animales' => null, 'tipo_discapacidad' => 'Visual', 'victima_conflicto_armado' => null,
        ], $usuario->id, false);

        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(), 'estado' => 'borrador',
            'linea_productiva_principal' => $lineaAgricola->getKey(), 'especie_productiva' => $platano->getKey(),
            'linea_productiva_secundaria' => $lineaPecuaria->getKey(), 'area_hectareas' => 3,
            'unidad_area_ingresada' => 'hectareas', 'numero_animales' => null,
            'tipo_discapacidad' => 'Visual', 'victima_conflicto_armado' => null,
        ]);
        $this->assertDatabaseHas('visitas_borradores', [
            'visita_extensionismo' => $borrador->getKey(), 'divipola' => $divipola->getKey(),
            'corregimiento' => $corregimiento->corregimiento, 'vereda' => $vereda->vereda,
        ]);
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$borrador->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('visita.campos.linea_productiva_principal', $lineaAgricola->getKey())
            ->where('visita.campos.especie_productiva', $platano->getKey())
            ->where('visita.campos.linea_productiva_secundaria', $lineaPecuaria->getKey())
            ->where('visita.campos.area_hectareas', '3.000000')
            ->where('visita.campos.unidad_area_ingresada', 'hectareas')
            ->where('visita.campos.tipo_discapacidad', 'Visual')
            ->where('visita.divipola', $divipola->getKey())
            ->where('visita.corregimiento', $corregimiento->corregimiento)
            ->where('visita.vereda', $vereda->vereda));

        $this->actingAs($usuario)->get('/visitas-extensionismo')->assertInertia(fn (Assert $page) => $page
            ->where('visitas.0.vereda', $vereda->nombre));
    }

    public function test_registro_final_exige_numero_de_animales_y_respuesta_de_victima_pero_admite_cero_y_s_n(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$datos, 'numero_animales' => '', 'victima_conflicto_armado' => '',
        ])->assertSessionHasErrors(['numero_animales', 'victima_conflicto_armado']);

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$datos, 'numero_animales' => 0, 'victima_conflicto_armado' => 'N',
        ])->assertRedirect('/visitas-extensionismo');

        $this->assertDatabaseHas('visitas_extensionismo', ['numero_animales' => 0, 'victima_conflicto_armado' => 'N']);
    }

    public function test_los_guardados_publican_notificaciones_confirmadas_por_el_servidor(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', $datos)
            ->assertRedirect()
            ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Borrador guardado correctamente. Puedes continuar diligenciándolo posteriormente']);

        $respuestaCreacion = $this->actingAs($usuario)->post('/visitas-extensionismo', $datos);
        $respuestaCreacion->assertRedirect('/visitas-extensionismo')
            ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Visita guardada correctamente. La información fue registrada satisfactoriamente']);

        $visita = VisitaExtensionismo::query()->where('estado', 'registrado')->firstOrFail();
        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$visita->getKey(), [
            ...$datos,
            'productor_existente' => $visita->productor,
            'predio_existente' => $visita->predio,
            'diagnostico' => 'Diagnóstico actualizado desde formulario',
        ])->assertRedirect('/visitas-extensionismo')
            ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Visita guardada correctamente. La información fue registrada satisfactoriamente']);
    }

    public function test_un_fallo_tecnico_del_guardado_muestra_mensaje_generico_y_conserva_la_solicitud(): void
    {
        $usuario = User::factory()->create();
        $this->mock(ServicioVisitasExtensionismo::class, function ($mock): void {
            $mock->shouldReceive('guardar')->once()->andThrow(new \RuntimeException('detalle técnico no público'));
        });

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', ['diagnostico' => 'Texto diligenciado'])
            ->assertRedirect()
            ->assertSessionHas('_old_input.diagnostico', 'Texto diligenciado')
            ->assertInertiaFlash('toast', ['type' => 'error', 'message' => 'No fue posible guardar la visita. Revisa los errores indicados e inténtalo nuevamente']);
    }

    public function test_un_productor_que_no_coincide_con_el_documento_se_reporta_como_validacion(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $visita = app(ServicioVisitasExtensionismo::class)->guardar($datos, $usuario->id, true);

        $respuesta = $this->actingAs($usuario)->put('/visitas-extensionismo/'.$visita->getKey(), [
            ...$datos,
            'productor_existente' => $visita->productor,
            'predio_existente' => $visita->predio,
            'numero_documento' => '999999',
        ]);

        $respuesta->assertSessionHasErrors('numero_documento')->assertInertiaFlashMissing('toast');
    }

    public function test_catalogo_mi10_f58_exhibe_solo_las_categorias_y_especies_aprobadas(): void
    {
        $usuario = User::factory()->create();
        $this->assertSame(['AGRICOLA', 'PECUARIO', 'OTRA'], DB::table('lineas_productivas')->whereIn('codigo', ['AGRICOLA', 'PECUARIO', 'OTRA'])->orderByRaw("CASE codigo WHEN 'AGRICOLA' THEN 1 WHEN 'PECUARIO' THEN 2 WHEN 'OTRA' THEN 3 END")->pluck('codigo')->all());

        $this->actingAs($usuario)->get('/visitas-extensionismo/crear')->assertInertia(fn (Assert $page) => $page
            ->has('lineasProductivas', 2)
            ->where('lineasProductivas.0.codigo', 'AGRICOLA')
            ->where('lineasProductivas.1.codigo', 'PECUARIO'));

        $agricolas = DB::table('especies_productivas')->join('lineas_productivas', 'lineas_productivas.linea_productiva', '=', 'especies_productivas.linea_productiva')->where('lineas_productivas.codigo', 'AGRICOLA')->orderBy('especies_productivas.especie_productiva')->pluck('especies_productivas.nombre')->all();
        $pecuarias = DB::table('especies_productivas')->join('lineas_productivas', 'lineas_productivas.linea_productiva', '=', 'especies_productivas.linea_productiva')->where('lineas_productivas.codigo', 'PECUARIO')->orderBy('especies_productivas.especie_productiva')->pluck('especies_productivas.nombre')->all();

        $this->assertSame(['Café', 'Cacao', 'Plátano', 'Maíz', 'Sorgo', 'Arroz', 'Yuca', 'Caña', 'Palma de aceite', 'Ref. comercial', 'Mango', 'Maracuyá', 'Papaya', 'Guayaba', 'Guanábana', 'Aguacate', 'Banano', 'Patilla', 'Zapote', 'Mamoncillo', 'Limón', 'Lima', 'Naranja', 'Mandarina', 'Piña', 'Otra'], $agricolas);
        $this->assertSame(['Bovino', 'Equino', 'Piscícola', 'Avícola', 'Porcino', 'Ovino', 'Otra'], $pecuarias);
    }

    public function test_guarda_actividad_agricola_pecuaria_y_otra_con_textos_libres(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $especie = EspecieProductiva::query()->where('codigo', 'MI10_CAFE')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $datos['linea_productiva_secundaria'] = LineaProductiva::query()->where('codigo', 'PECUARIO')->value('linea_productiva');

        $this->actingAs($usuario)->post('/visitas-extensionismo', $datos)->assertRedirect('/visitas-extensionismo');
        $visitaAgricola = VisitaExtensionismo::query()->latest('visita_extensionismo')->firstOrFail();
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visitaAgricola->getKey(), 'linea_productiva_principal_otra' => null, 'especie_productiva_otra' => null]);
        $this->assertDatabaseHas('cambios_auditoria', ['campo' => 'linea_productiva_principal']);

        $otra = LineaProductiva::query()->where('codigo', 'OTRA')->value('linea_productiva');
        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$datos,
            'linea_productiva_principal' => $otra,
            'especie_productiva' => null,
        ])->assertSessionHasErrors('linea_productiva_principal');

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$datos,
            'linea_productiva_secundaria' => $otra,
        ])->assertSessionHasErrors('linea_productiva_secundaria');

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', [
            'linea_productiva_secundaria' => $otra,
        ])->assertSessionHasErrors('linea_productiva_secundaria');

        $this->assertDatabaseCount('visitas_extensionismo', 1);
    }

    public function test_crea_un_predio_adicional_en_casanare_sin_duplicar_productor(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->where('codigo_departamento', '85')->firstOrFail();
        $corregimiento = DB::table('corregimientos')->where('divipola', $divipola->getKey())->firstOrFail();
        $vereda = DB::table('veredas')->where('corregimiento', $corregimiento->corregimiento)->firstOrFail();
        $linea = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $especie = EspecieProductiva::query()->where('codigo', 'MI10_CAFE')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = [
            ...$this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()),
            'departamento' => '85',
            'corregimiento' => $corregimiento->corregimiento,
            'vereda' => $vereda->vereda,
        ];

        $this->actingAs($usuario)->post('/visitas-extensionismo', $datos)->assertRedirect('/visitas-extensionismo');
        $primeraVisita = VisitaExtensionismo::query()->firstOrFail();

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$datos,
            'productor_existente' => $primeraVisita->productor,
            'predio_existente' => '',
            'nombre_predio' => 'Predio adicional Casanare',
            'latitud' => 5.4,
            'longitud' => -72.4,
        ])->assertRedirect('/visitas-extensionismo');

        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 2);
        $this->assertDatabaseHas('predios', [
            'productor' => $primeraVisita->productor,
            'nombre' => 'Predio adicional Casanare',
            'divipola' => $divipola->getKey(),
            'corregimiento' => $corregimiento->corregimiento,
            'vereda' => $vereda->vereda,
            'latitud' => 5.4,
            'longitud' => -72.4,
        ]);
    }

    public function test_consulta_productor_devuelve_varios_predios_con_su_ubicacion_completa(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->where('codigo_departamento', '85')->firstOrFail();
        $corregimiento = DB::table('corregimientos')->where('divipola', $divipola->getKey())->firstOrFail();
        $vereda = DB::table('veredas')->where('corregimiento', $corregimiento->corregimiento)->firstOrFail();
        $productor = DB::table('productores')->insertGetId([
            'nombres' => 'Productor',
            'apellidos' => 'Casanare',
            'tipo_documento' => 'Cédula de ciudadanía',
            'numero_documento' => '858585',
            'telefono' => '3000000000',
            'sexo' => 'Femenino',
            'created_at' => now(),
            'updated_at' => now(),
        ], 'productor');
        Predio::query()->create([
            'productor' => $productor,
            'nombre' => 'Predio principal',
            'divipola' => $divipola->getKey(),
            'corregimiento' => $corregimiento->corregimiento,
            'vereda' => $vereda->vereda,
            'latitud' => 5.1234567,
            'longitud' => -72.1234567,
        ]);
        Predio::query()->create([
            'productor' => $productor,
            'nombre' => 'Predio secundario',
            'divipola' => $divipola->getKey(),
            'corregimiento' => $corregimiento->corregimiento,
            'vereda' => $vereda->vereda,
            'latitud' => 5.2234567,
            'longitud' => -72.2234567,
        ]);

        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?tipo_documento=Cédula%20de%20ciudadanía&numero_documento=858585')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonCount(2, '0.predios')
            ->assertJsonPath('0.predios.0.divipola', $divipola->getKey())
            ->assertJsonPath('0.predios.0.corregimiento', $corregimiento->corregimiento)
            ->assertJsonPath('0.predios.0.vereda', $vereda->vereda)
            ->assertJsonPath('0.predios.0.latitud', '5.1234567')
            ->assertJsonPath('0.predios.0.longitud', '-72.1234567');
    }

    public function test_rechaza_una_combinacion_territorial_inconsistente(): void
    {
        $usuario = User::factory()->create();
        $corregimiento = DB::table('corregimientos')->firstOrFail();
        $divipola = Divipola::query()->where('codigo_departamento', '85')->where('divipola', '!=', $corregimiento->divipola)->firstOrFail();
        $linea = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $especie = EspecieProductiva::query()->where('codigo', 'MI10_CAFE')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()),
            'departamento' => '85',
            'corregimiento' => $corregimiento->corregimiento,
        ])->assertSessionHasErrors('corregimiento');

        $this->assertDatabaseCount('productores', 0);
        $this->assertDatabaseCount('predios', 0);
    }

    public function test_rechaza_especie_incompatible_con_la_linea_principal(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $agricola = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $bovino = EspecieProductiva::query()->where('codigo', 'MI10_BOVINO')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $agricola->getKey(), $bovino->getKey(), $enfoque->getKey());

        $this->actingAs($usuario)->post('/visitas-extensionismo', $datos)->assertSessionHasErrors('especie_productiva');
        $this->assertDatabaseCount('visitas_extensionismo', 0);
    }

    public function test_valida_especies_por_la_linea_principal_y_permite_una_secundaria_diferente(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $agricola = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $pecuario = LineaProductiva::query()->where('codigo', 'PECUARIO')->firstOrFail();
        $platano = EspecieProductiva::query()->where('codigo', 'MI10_PLATANO')->firstOrFail();
        $bovino = EspecieProductiva::query()->where('codigo', 'MI10_BOVINO')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();

        $agricolaConPlatano = [
            ...$this->datos($divipola->getKey(), $agricola->getKey(), $platano->getKey(), $enfoque->getKey()),
            'linea_productiva_secundaria' => $pecuario->getKey(),
        ];
        $this->actingAs($usuario)->post('/visitas-extensionismo', $agricolaConPlatano)
            ->assertRedirect('/visitas-extensionismo');

        $pecuarioConBovino = [
            ...$this->datos($divipola->getKey(), $pecuario->getKey(), $bovino->getKey(), $enfoque->getKey()),
            'numero_documento' => '123457',
            'linea_productiva_secundaria' => $agricola->getKey(),
        ];
        $this->actingAs($usuario)->post('/visitas-extensionismo', $pecuarioConBovino)
            ->assertRedirect('/visitas-extensionismo');

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$this->datos($divipola->getKey(), $agricola->getKey(), $bovino->getKey(), $enfoque->getKey()),
            'numero_documento' => '123458',
        ])->assertSessionHasErrors('especie_productiva');

        $this->actingAs($usuario)->post('/visitas-extensionismo', [
            ...$this->datos($divipola->getKey(), $pecuario->getKey(), $platano->getKey(), $enfoque->getKey()),
            'numero_documento' => '123459',
        ])->assertSessionHasErrors('especie_productiva');

        $this->assertDatabaseCount('visitas_extensionismo', 2);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'linea_productiva_principal' => $agricola->getKey(),
            'especie_productiva' => $platano->getKey(),
            'linea_productiva_secundaria' => $pecuario->getKey(),
        ]);
        $this->assertDatabaseHas('visitas_extensionismo', [
            'linea_productiva_principal' => $pecuario->getKey(),
            'especie_productiva' => $bovino->getKey(),
            'linea_productiva_secundaria' => $agricola->getKey(),
        ]);
    }

    public function test_aplica_la_misma_compatibilidad_al_actualizar_borradores_y_visitas(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $agricola = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $cafe = EspecieProductiva::query()->where('codigo', 'MI10_CAFE')->firstOrFail();
        $bovino = EspecieProductiva::query()->where('codigo', 'MI10_BOVINO')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $agricola->getKey(), $cafe->getKey(), $enfoque->getKey());

        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', $datos)->assertRedirect();
        $borrador = VisitaExtensionismo::query()->where('estado', 'borrador')->firstOrFail();
        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$borrador->getKey().'/borrador', [
            ...$datos,
            'especie_productiva' => $bovino->getKey(),
        ])->assertSessionHasErrors('especie_productiva');
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $borrador->getKey(),
            'especie_productiva' => $cafe->getKey(),
        ]);

        $datosRegistrados = [...$datos, 'numero_documento' => '123457'];
        $this->actingAs($usuario)->post('/visitas-extensionismo', $datosRegistrados)->assertRedirect();
        $visita = VisitaExtensionismo::query()->where('estado', 'registrado')->firstOrFail();
        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$visita->getKey(), [
            ...$datosRegistrados,
            'productor_existente' => $visita->productor,
            'predio_existente' => $visita->predio,
            'especie_productiva' => $bovino->getKey(),
        ])->assertSessionHasErrors('especie_productiva');
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $visita->getKey(),
            'especie_productiva' => $cafe->getKey(),
        ]);
    }

    public function test_borrador_y_edicion_recuperan_los_valores_canonicos_y_los_textos_libres(): void
    {
        $usuario = User::factory()->create();
        $linea = LineaProductiva::query()->where('codigo', 'PECUARIO')->value('linea_productiva');
        $especie = EspecieProductiva::query()->where('codigo', 'MI10_OTRA_PECUARIO')->value('especie_productiva');
        $borrador = $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', [
            'linea_productiva_principal' => $linea,
            'especie_productiva' => $especie,
            'especie_productiva_otra' => 'Cunicultura',
            'linea_productiva_secundaria' => LineaProductiva::query()->where('codigo', 'AGRICOLA')->value('linea_productiva'),
        ]);

        $visita = VisitaExtensionismo::query()->firstOrFail();
        $borrador->assertRedirect('/visitas-extensionismo/'.$visita->getKey().'/editar');
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('visita.campos.linea_productiva_principal', $linea)
            ->where('visita.campos.especie_productiva', $especie)
            ->where('visita.campos.especie_productiva_otra', 'Cunicultura')
            ->where('visita.campos.linea_productiva_secundaria', LineaProductiva::query()->where('codigo', 'AGRICOLA')->value('linea_productiva')));
    }

    public function test_edita_una_linea_otra_historica_sin_mostrarla_como_opcion_y_la_preserva(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $agricola = LineaProductiva::query()->where('codigo', 'AGRICOLA')->firstOrFail();
        $cafe = EspecieProductiva::query()->where('codigo', 'MI10_CAFE')->firstOrFail();
        $otra = LineaProductiva::query()->where('codigo', 'OTRA')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $visita = app(ServicioVisitasExtensionismo::class)->guardar($this->datos($divipola->getKey(), $agricola->getKey(), $cafe->getKey(), $enfoque->getKey()), $usuario->id, true);

        DB::table('visitas_extensionismo')->where('visita_extensionismo', $visita->getKey())->update([
            'linea_productiva_principal' => $otra->getKey(),
            'linea_productiva_secundaria' => $otra->getKey(),
            'especie_productiva' => null,
            'linea_productiva_principal_otra' => 'Actividad histórica',
            'linea_productiva_secundaria_otra' => 'Línea secundaria histórica',
        ]);

        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->has('lineasProductivas', 2)
            ->where('visita.actividadHistorica.principal.nombre', 'Otra')
            ->where('visita.actividadHistorica.secundaria.nombre', 'Otra'));

        $datos = $this->datos($divipola->getKey(), $otra->getKey(), $cafe->getKey(), $enfoque->getKey());
        unset($datos['especie_productiva']);
        $datos['linea_productiva_secundaria'] = $otra->getKey();
        $datos['productor_existente'] = $visita->productor;
        $datos['predio_existente'] = $visita->predio;

        $this->actingAs($usuario)->put('/visitas-extensionismo/'.$visita->getKey(), $datos)->assertRedirect('/visitas-extensionismo');

        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $visita->getKey(),
            'linea_productiva_principal' => $otra->getKey(),
            'linea_productiva_secundaria' => $otra->getKey(),
            'especie_productiva' => null,
            'linea_productiva_principal_otra' => 'Actividad histórica',
            'linea_productiva_secundaria_otra' => 'Línea secundaria histórica',
        ]);
    }

    public function test_editar_visita_legacy_preserva_sus_relaciones_y_presenta_categorias_canonicas(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $legacyLine = LineaProductiva::query()->where('codigo', 'GANADERIA_BOVINA')->firstOrFail();
        $legacySecondary = LineaProductiva::query()->where('codigo', 'ARROZ')->firstOrFail();
        $legacySpecies = EspecieProductiva::query()->where('codigo', 'BOVINO')->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $visita = app(ServicioVisitasExtensionismo::class)->guardar($this->datos($divipola->getKey(), $legacyLine->getKey(), $legacySpecies->getKey(), $enfoque->getKey()), $usuario->id, true);
        DB::table('visitas_extensionismo')->where('visita_extensionismo', $visita->getKey())->update(['linea_productiva_principal' => $legacyLine->getKey(), 'linea_productiva_secundaria' => $legacySecondary->getKey(), 'especie_productiva' => $legacySpecies->getKey()]);

        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('visita.campos.linea_productiva_principal', LineaProductiva::query()->where('codigo', 'PECUARIO')->value('linea_productiva'))
            ->where('visita.campos.linea_productiva_secundaria', LineaProductiva::query()->where('codigo', 'AGRICOLA')->value('linea_productiva'))
            ->where('visita.campos.especie_productiva', EspecieProductiva::query()->where('codigo', 'MI10_BOVINO')->value('especie_productiva')));

        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visita->getKey(), 'linea_productiva_principal' => $legacyLine->getKey(), 'linea_productiva_secundaria' => $legacySecondary->getKey(), 'especie_productiva' => $legacySpecies->getKey()]);
    }

    public function test_registro_conserva_diferencias_temporales_sin_sobrescribir_datos_definitivos(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $servicio = app(ServicioVisitasExtensionismo::class);
        $visitaRegistrada = $servicio->guardar($datos, $usuario->id, true);
        $visita = $servicio->guardar([
            ...$datos,
            'nombres' => 'Nombre pendiente de conciliación',
            'nombre_predio' => 'Predio pendiente de conciliación',
            'latitud' => 6.1234567,
        ], $usuario->id, false);

        $servicio->guardar([
            ...$datos,
            'nombres' => 'Nombre pendiente de conciliación',
            'nombre_predio' => 'Predio pendiente de conciliación',
            'latitud' => 6.1234567,
            'productor_existente' => $visitaRegistrada->productor,
            'predio_existente' => $visitaRegistrada->predio,
        ], $usuario->id, true, $visita);

        $this->assertDatabaseHas('productores', ['productor' => $visitaRegistrada->productor, 'nombres' => 'Ana']);
        $this->assertDatabaseHas('predios', ['predio' => $visitaRegistrada->predio, 'nombre' => 'El Porvenir', 'latitud' => 5.337]);
        $this->assertDatabaseHas('visitas_borradores', [
            'visita_extensionismo' => $visita->getKey(),
            'nombres_productor' => 'Nombre pendiente de conciliación',
            'nombre_predio' => 'Predio pendiente de conciliación',
            'latitud' => 6.1234567,
            'apellidos_productor' => null,
            'numero_documento' => null,
        ]);
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('visita.nombres', 'Nombre pendiente de conciliación')
            ->where('visita.nombre_predio', 'Predio pendiente de conciliación')
            ->where('visita.latitud', '6.1234567'));
    }

    public function test_finalizar_borrador_con_datos_consolidados_elimina_el_registro_temporal(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $servicio = app(ServicioVisitasExtensionismo::class);
        $borrador = $servicio->guardar($datos, $usuario->id, false);

        $visita = $servicio->guardar($datos, $usuario->id, true, $borrador);

        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visita->getKey(), 'estado' => 'registrado']);
        $this->assertDatabaseCount('productores', 1);
        $this->assertDatabaseCount('predios', 1);
        $this->assertDatabaseMissing('visitas_borradores', ['visita_extensionismo' => $visita->getKey()]);
        $this->assertDatabaseHas('cambios_auditoria', ['campo' => 'borrador.nombres_productor', 'valor_anterior' => 'Ana', 'valor_nuevo' => null]);
    }

    public function test_busca_productor_con_sus_predios_y_conserva_fotografia_al_actualizar(): void
    {
        Storage::fake('local');
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $datos['fotografias'] = [UploadedFile::fake()->image('evidencia.jpg')];
        $visita = app(ServicioVisitasExtensionismo::class)->guardar($datos, $usuario->id, true);

        $respuestaDocumento = $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?numero_documento=123456');
        $respuestaDocumento->assertOk()->assertJsonPath('0.numero_documento', '123456')->assertJsonPath('0.predios.0.nombre', 'El Porvenir');
        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?tipo_documento=Cédula+de+ciudadanía&numero_documento=123456')->assertOk()->assertJsonCount(1)->assertJsonPath('0.productor', $visita->productor);
        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?tipo_documento=Pasaporte&numero_documento=123456')->assertOk()->assertJsonCount(0);
        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?nombres=Ana')->assertOk()->assertJsonCount(1);
        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?apellidos=Rural')->assertOk()->assertJsonCount(1);
        $this->assertDatabaseCount('archivos', 1);
        $this->assertDatabaseCount('anexos', 1);
        $archivo = $visita->anexos()->firstOrFail()->archivo()->firstOrFail();
        Storage::disk('local')->assertExists($archivo->ruta);
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/fotografias/'.$visita->anexos()->firstOrFail()->getKey())->assertOk();
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/editar')->assertInertia(fn (Assert $page) => $page->where('visita.productor.productor', $visita->productor)->where('visita.productor.predios.0.predio', $visita->predio));

        app(ServicioVisitasExtensionismo::class)->guardar([...$datos, 'fotografias' => [], 'diagnostico' => 'Otro diagnóstico'], $usuario->id, true, $visita);
        $this->assertDatabaseCount('archivos', 1);
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visita->getKey(), 'diagnostico' => 'Otro diagnóstico']);
    }

    public function test_usuario_autenticado_puede_eliminar_una_fotografia_y_se_audita_sin_afectar_otras(): void
    {
        Storage::fake('local');
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $datos['fotografias'] = [
            UploadedFile::fake()->image('primera.jpg'),
            UploadedFile::fake()->image('segunda.png'),
        ];
        $visita = app(ServicioVisitasExtensionismo::class)->guardar($datos, $usuario->id, true);
        $anexos = $visita->anexos()->get();
        $eliminado = $anexos->firstOrFail();
        $conservado = $anexos->last();
        $rutaEliminada = $eliminado->archivo()->firstOrFail()->ruta;
        $rutaConservada = $conservado->archivo()->firstOrFail()->ruta;

        $this->actingAs($usuario)->delete('/visitas-extensionismo/'.$visita->getKey().'/fotografias/'.$eliminado->getKey())
            ->assertRedirect();

        $this->assertDatabaseMissing('anexos', ['anexo' => $eliminado->getKey()]);
        $this->assertDatabaseMissing('archivos', ['ruta' => $rutaEliminada]);
        $this->assertDatabaseHas('anexos', ['anexo' => $conservado->getKey(), 'registro' => $visita->getKey()]);
        Storage::disk('local')->assertMissing($rutaEliminada);
        Storage::disk('local')->assertExists($rutaConservada);
        $this->assertDatabaseHas('versiones_auditoria', ['registro' => $visita->getKey(), 'accion' => 'Fotografía eliminada']);

        $this->delete('/visitas-extensionismo/'.$visita->getKey().'/fotografias/'.$conservado->getKey())->assertRedirect('/');
    }

    public function test_guardar_sin_cambios_no_crea_otra_version(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        $servicio = app(ServicioVisitasExtensionismo::class);
        $visita = $servicio->guardar($datos, $usuario->id, true);
        $versiones = $visita->getKey();
        $servicio->guardar($datos + ['productor_existente' => $visita->productor, 'predio_existente' => $visita->predio], $usuario->id, true, $visita);

        $this->assertDatabaseCount('versiones_auditoria', 2);
        $this->assertNotSame(0, $versiones);
    }

    public function test_bandeja_y_directorio_aplican_filtros_y_entregan_paginacion_real(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $servicio = app(ServicioVisitasExtensionismo::class);
        $servicio->guardar($this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey()), $usuario->id, true);

        $respuesta = $this->actingAs($usuario)->get('/visitas-extensionismo?buscar=El+Porvenir&page=1');
        $respuesta->assertStatus(200);
        $respuesta->assertInertia(fn (Assert $page) => $page->component('visitas-extensionismo/listado')->where('paginacion.total', 1)->where('filtros.buscar', 'El Porvenir'));
        $this->actingAs($usuario)->get('/productores?nombre=Ana&documento=123456')->assertInertia(fn (Assert $page) => $page->component('productores/listado')->where('paginacion.total', 1)->where('totalProductores', 1)->where('filtros.nombre', 'Ana'));
    }

    public function test_guarda_areas_normalizadas_en_hectareas_y_recupera_la_unidad_original(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->firstOrFail();
        $linea = LineaProductiva::query()->firstOrFail();
        $especie = EspecieProductiva::query()->firstOrFail();
        $enfoque = EnfoquePoblacional::query()->firstOrFail();
        $datos = $this->datos($divipola->getKey(), $linea->getKey(), $especie->getKey(), $enfoque->getKey());
        unset($datos['area_hectareas']);
        $datos['area_valor_ingresado'] = '250,50';
        $datos['unidad_area_ingresada'] = 'areas';

        $this->actingAs($usuario)->post('/visitas-extensionismo', $datos)->assertRedirect('/visitas-extensionismo');

        $visita = VisitaExtensionismo::query()->firstOrFail();
        $this->assertDatabaseHas('visitas_extensionismo', [
            'visita_extensionismo' => $visita->getKey(),
            'area_hectareas' => 2.505,
            'unidad_area_ingresada' => 'areas',
        ]);
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/editar')->assertInertia(fn (Assert $page) => $page
            ->where('visita.campos.area_hectareas', '2.505000')
            ->where('visita.campos.unidad_area_ingresada', 'areas'));
    }

    public function test_rechaza_superficies_negativas(): void
    {
        $usuario = User::factory()->create();
        $this->actingAs($usuario)->post('/visitas-extensionismo/borrador', [
            'area_valor_ingresado' => '-1',
            'unidad_area_ingresada' => 'hectareas',
        ])->assertSessionHasErrors('area_valor_ingresado');
    }

    /** @return array<string, mixed> */
    private function datos(int $divipola, int $linea, int $especie, int $enfoque): array
    {
        return ['nombres' => 'Ana', 'apellidos' => 'Rural', 'tipo_documento' => 'Cédula de ciudadanía', 'numero_documento' => '123456', 'telefono' => '3001234567', 'sexo' => 'Femenino', 'nombre_predio' => 'El Porvenir', 'divipola' => $divipola, 'fecha_visita' => '2026-11-12', 'latitud' => 5.337, 'longitud' => -72.395, 'linea_productiva_principal' => $linea, 'especie_productiva' => $especie, 'numero_animales' => 0, 'area_hectareas' => 3, 'victima_conflicto_armado' => 'N', 'aspecto_visita' => 'Sanidad', 'componente_visita' => 'Manejo', 'diagnostico' => 'Diagnóstico inicial', 'actividades_realizadas' => 'Visita técnica', 'recomendaciones' => 'Seguimiento', 'compromisos' => 'Aplicar recomendaciones', 'nombre_extensionista' => 'Funcionario SIGRA', 'numero_documento_extensionista' => '999', 'disciplina_extensionista' => 'Agronomía', 'titulo_academico_extensionista' => 'Ingeniero agrónomo', 'enfoques_poblacionales' => [$enfoque]];
    }
}
