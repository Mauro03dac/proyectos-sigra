<?php

namespace Tests\Feature;

use App\Models\Productor;
use App\Models\User;
use App\Servicios\ServicioAuditoria;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductorTest extends TestCase
{
    use RefreshDatabase;

    public function test_directorio_entrega_trazabilidad_del_productor_con_su_identificador(): void
    {
        $usuario = User::factory()->create(['name' => 'Auditor SIGRA']);
        $productor = Productor::query()->create([
            'nombres' => 'Ana',
            'apellidos' => 'Rural',
            'tipo_documento' => 'Cédula de ciudadanía',
            'numero_documento' => '123456',
            'telefono' => '3001234567',
        ]);
        app(ServicioAuditoria::class)->registrar(
            'productor',
            (int) $productor->getKey(),
            'Creación',
            (int) $usuario->getKey(),
            ['nombres' => ['anterior' => null, 'nuevo' => 'Ana']],
        );

        $this->actingAs($usuario)
            ->get('/productores')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('productores/listado')
                ->where('productores.0.id', (string) $productor->getKey())
                ->where('historialTrazabilidad.'.$productor->getKey().'.0.numero', 1)
                ->where('historialTrazabilidad.'.$productor->getKey().'.0.usuario', 'Auditor SIGRA')
                ->where('historialTrazabilidad.'.$productor->getKey().'.0.cambios.0.nuevo', 'Ana'));
    }
}
