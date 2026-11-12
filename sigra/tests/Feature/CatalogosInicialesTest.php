<?php

namespace Tests\Feature;

use App\Models\Divipola;
use App\Models\EnfoquePoblacional;
use App\Models\LineaProductiva;
use App\Support\Catalogos\CargadorCatalogosIniciales;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CatalogosInicialesTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_carga_los_catalogos_iniciales_y_las_localidades_de_yopal(): void
    {
        $this->assertSame(1122, DB::table('divipolas')->count());
        $this->assertSame(11, DB::table('corregimientos')->count());
        $this->assertSame(99, DB::table('veredas')->count());
        $this->assertSame(12, DB::table('enfoques_poblacionales')->count());
        $this->assertSame(18, DB::table('lineas_productivas')->count());
        $this->assertSame(10, DB::table('especies_productivas')->count());
        $this->assertSame(24, DB::table('cultivos')->count());
        $this->assertSame(27, DB::table('razas_pecuarias')->count());

        $this->assertDatabaseHas('divipolas', [
            'codigo_municipio' => '85001',
            'nombre_municipio' => 'YOPAL',
        ]);

        $yopal = Divipola::query()->where('codigo_municipio', '85001')->firstOrFail();

        $this->assertSame(11, $yopal->corregimientos()->count());
        $this->assertSame(15, $yopal->corregimientos()->where('nombre', 'CHARTE')->firstOrFail()->veredas()->count());
    }

    public function test_los_catalogos_se_pueden_recargar_sin_duplicar_registros(): void
    {
        app(CargadorCatalogosIniciales::class)->cargarTodos();

        $this->assertSame(1122, DB::table('divipolas')->count());
        $this->assertSame(99, DB::table('veredas')->count());
        $this->assertSame(12, EnfoquePoblacional::query()->count());
        $this->assertSame(18, LineaProductiva::query()->count());
    }

    public function test_las_tablas_operativas_comienzan_vacias(): void
    {
        $this->assertSame(0, DB::table('productores')->count());
        $this->assertSame(0, DB::table('predios')->count());
        $this->assertSame(0, DB::table('visitas_extensionismo')->count());
        $this->assertSame(0, DB::table('versiones_auditoria')->count());
        $this->assertSame(0, DB::table('cambios_auditoria')->count());
    }
}
