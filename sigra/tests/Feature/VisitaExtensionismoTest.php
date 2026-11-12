<?php

namespace Tests\Feature;

use App\Models\Divipola;
use App\Models\EnfoquePoblacional;
use App\Models\EspecieProductiva;
use App\Models\LineaProductiva;
use App\Models\User;
use App\Servicios\ServicioVisitasExtensionismo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visita->getKey(), 'diagnostico' => 'Diagnóstico actualizado', 'estado' => 'registrado']);
        $this->assertDatabaseHas('visitas_enfoques_poblacionales', ['visita_extensionismo' => $visita->getKey(), 'enfoque_poblacional' => $enfoque->getKey()]);
        $this->assertDatabaseHas('cambios_auditoria', ['campo' => 'diagnostico', 'valor_nuevo' => 'Diagnóstico actualizado']);
    }

    public function test_borrador_no_crea_productor_ni_predio_y_se_actualiza_en_el_mismo_registro(): void
    {
        $usuario = User::factory()->create();
        $servicio = app(ServicioVisitasExtensionismo::class);
        $borrador = $servicio->guardar(['nombres' => 'Ana', 'apellidos' => 'Rural', 'diagnostico' => 'Parcial'], $usuario->id, false);
        $servicio->guardar(['nombres' => 'Ana', 'apellidos' => 'Rural', 'diagnostico' => 'Corregido'], $usuario->id, false, $borrador);

        $this->assertDatabaseCount('productores', 0);
        $this->assertDatabaseCount('predios', 0);
        $this->assertDatabaseCount('visitas_extensionismo', 1);
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $borrador->getKey(), 'estado' => 'borrador', 'diagnostico' => 'Corregido']);
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
        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?nombres=Ana')->assertOk()->assertJsonCount(1);
        $this->actingAs($usuario)->getJson('/visitas-extensionismo/productores?apellidos=Rural')->assertOk()->assertJsonCount(1);
        $this->assertDatabaseCount('archivos', 1);
        $this->assertDatabaseCount('anexos', 1);
        $archivo = $visita->anexos()->firstOrFail()->archivo()->firstOrFail();
        Storage::disk('local')->assertExists($archivo->ruta);
        $this->actingAs($usuario)->get('/visitas-extensionismo/'.$visita->getKey().'/fotografias/'.$visita->anexos()->firstOrFail()->getKey())->assertOk();

        app(ServicioVisitasExtensionismo::class)->guardar([...$datos, 'fotografias' => [], 'diagnostico' => 'Otro diagnóstico'], $usuario->id, true, $visita);
        $this->assertDatabaseCount('archivos', 1);
        $this->assertDatabaseHas('visitas_extensionismo', ['visita_extensionismo' => $visita->getKey(), 'diagnostico' => 'Otro diagnóstico']);
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

    /** @return array<string, mixed> */
    private function datos(int $divipola, int $linea, int $especie, int $enfoque): array
    {
        return ['nombres' => 'Ana', 'apellidos' => 'Rural', 'tipo_documento' => 'Cédula de ciudadanía', 'numero_documento' => '123456', 'telefono' => '3001234567', 'sexo' => 'Femenino', 'nombre_predio' => 'El Porvenir', 'divipola' => $divipola, 'fecha_visita' => '2026-11-12', 'latitud' => 5.337, 'longitud' => -72.395, 'linea_productiva_principal' => $linea, 'especie_productiva' => $especie, 'area_hectareas' => 3, 'aspecto_visita' => 'Sanidad', 'componente_visita' => 'Manejo', 'diagnostico' => 'Diagnóstico inicial', 'actividades_realizadas' => 'Visita técnica', 'recomendaciones' => 'Seguimiento', 'compromisos' => 'Aplicar recomendaciones', 'nombre_extensionista' => 'Funcionario SIGRA', 'numero_documento_extensionista' => '999', 'disciplina_extensionista' => 'Agronomía', 'titulo_academico_extensionista' => 'Ingeniero agrónomo', 'enfoques_poblacionales' => [$enfoque]];
    }
}
