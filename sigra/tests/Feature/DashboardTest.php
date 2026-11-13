<?php

namespace Tests\Feature;

use App\Models\Divipola;
use App\Models\EnfoquePoblacional;
use App\Models\EspecieProductiva;
use App\Models\LineaProductiva;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Servicios\ServicioVisitasExtensionismo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_incluye_visitas_registradas_y_sus_datos_relacionados(): void
    {
        $usuario = User::factory()->create();
        $visita = app(ServicioVisitasExtensionismo::class)->guardar([
            'nombres' => 'Ana', 'apellidos' => 'Rural', 'tipo_documento' => 'Cédula de ciudadanía',
            'numero_documento' => '123456', 'telefono' => '3001234567', 'sexo' => 'Femenino',
            'nombre_predio' => 'El Porvenir', 'divipola' => Divipola::query()->firstOrFail()->getKey(),
            'fecha_visita' => '2026-11-12', 'latitud' => 5.337, 'longitud' => -72.395,
            'linea_productiva_principal' => LineaProductiva::query()->firstOrFail()->getKey(),
            'especie_productiva' => EspecieProductiva::query()->firstOrFail()->getKey(),
            'area_hectareas' => 3, 'unidad_area_ingresada' => 'hectareas', 'aspecto_visita' => 'Sanidad',
            'componente_visita' => 'Manejo', 'diagnostico' => 'Diagnóstico inicial',
            'actividades_realizadas' => 'Visita técnica', 'recomendaciones' => 'Seguimiento',
            'compromisos' => 'Aplicar recomendaciones', 'nombre_extensionista' => 'Funcionario SIGRA',
            'numero_documento_extensionista' => '999', 'disciplina_extensionista' => 'Agronomía',
            'titulo_academico_extensionista' => 'Ingeniero agrónomo',
            'enfoques_poblacionales' => [EnfoquePoblacional::query()->firstOrFail()->getKey()],
        ], $usuario->id, true);

        $this->actingAs($usuario)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('registros.0.numero', (string) $visita->getKey())
                ->where('registros.0.productor', 'Ana Rural')
                ->where('registros.0.predio', 'El Porvenir')
                ->where('registros.0.estado', 'Registrada')
                ->where('registros.0.estadoReal', 'registrado')
                ->where('registros.0.tipoVisita', 'MI10-F58')
                ->where('indicadores.visitasExtensionismo', 1)
                ->where('historialTrazabilidad.'.$visita->getKey().'.0.numero', 1)
                ->where('historialTrazabilidad.'.$visita->getKey().'.0.usuario', $usuario->name));
    }

    public function test_dashboard_y_bandeja_conservan_el_estado_real_del_borrador(): void
    {
        $usuario = User::factory()->create();
        $borrador = app(ServicioVisitasExtensionismo::class)->guardar([
            'nombres' => 'Borrador',
            'apellidos' => 'SIGRA',
            'nombre_predio' => 'Predio pendiente',
            'diagnostico' => 'Información pendiente',
        ], $usuario->id, false);

        $this->actingAs($usuario)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('registros.0.estado', 'Borrador')
                ->where('registros.0.estadoReal', 'borrador'));

        $this->actingAs($usuario)
            ->get(route('visitas-extensionismo.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('visitas.0.numero', (string) $borrador->getKey())
                ->where('visitas.0.estado', 'Borrador')
                ->where('visitas.0.estadoReal', 'borrador'));
    }

    public function test_dashboard_muestra_la_vereda_temporal_de_un_borrador(): void
    {
        $usuario = User::factory()->create();
        $divipola = Divipola::query()->whereIn('divipola', DB::table('corregimientos')->select('divipola'))->firstOrFail();
        $corregimiento = DB::table('corregimientos')->where('divipola', $divipola->getKey())->firstOrFail();
        $vereda = DB::table('veredas')->where('corregimiento', $corregimiento->corregimiento)->firstOrFail();
        app(ServicioVisitasExtensionismo::class)->guardar([
            'nombre_predio' => 'Predio temporal', 'divipola' => $divipola->getKey(),
            'corregimiento' => $corregimiento->corregimiento, 'vereda' => $vereda->vereda,
        ], $usuario->id, false);

        $this->actingAs($usuario)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
            ->where('registros.0.vereda', $vereda->nombre));
    }
}
