<?php

namespace Tests\Feature;

use App\Models\Productor;
use App\Models\VisitaExtensionismo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EstandarizacionTimestampsTest extends TestCase
{
    use RefreshDatabase;

    public function test_las_tablas_sigra_exponen_timestamps_estandar_y_los_catalogos_se_cargan(): void
    {
        $tablas = [
            'divipolas',
            'corregimientos',
            'veredas',
            'productores',
            'predios',
            'enfoques_poblacionales',
            'lineas_productivas',
            'especies_productivas',
            'cultivos',
            'razas_pecuarias',
            'visitas_extensionismo',
            'visitas_enfoques_poblacionales',
            'archivos',
            'anexos',
            'versiones_auditoria',
            'cambios_auditoria',
        ];

        foreach ($tablas as $tabla) {
            $this->assertTrue(Schema::hasColumns($tabla, ['created_at', 'updated_at']), "La tabla {$tabla} no tiene los timestamps estándar.");
            $this->assertFalse(Schema::hasColumn($tabla, 'fecha_creacion'));
            $this->assertFalse(Schema::hasColumn($tabla, 'fecha_actualizacion'));
        }

        $this->assertSame(1122, DB::table('divipolas')->count());
        $this->assertSame(11, DB::table('corregimientos')->count());
        $this->assertSame(99, DB::table('veredas')->count());
        $this->assertGreaterThan(0, DB::table('lineas_productivas')->count());
    }

    public function test_la_base_conserva_la_estructura_conciliada_de_visitas(): void
    {
        $this->assertTrue(Schema::hasTable('visitas_borradores'));
        $this->assertFalse(Schema::hasColumn('visitas_extensionismo', 'nombres_productor_borrador'));
        $this->assertFalse(Schema::hasColumn('visitas_extensionismo', 'longitud_borrador'));
        $this->assertTrue(Schema::hasColumn('visitas_extensionismo', 'unidad_area_ingresada'));
        $this->assertTrue(Schema::hasColumn('visitas_enfoques_poblacionales', 'id_enfoque_poblacional'));
        $this->assertFalse(Schema::hasColumn('visitas_enfoques_poblacionales', 'visita_enfoque_poblacional'));

        $primaryKey = DB::selectOne('select name from pragma_table_info(?) where pk = 1', ['visitas_enfoques_poblacionales']);

        $this->assertSame('id_enfoque_poblacional', $primaryKey->name);
    }

    public function test_la_migracion_renombra_timestamps_sin_perder_valores(): void
    {
        DB::table('productores')->insert([
            'nombres' => 'Marca',
            'apellidos' => 'Temporal',
            'tipo_documento' => 'Pasaporte',
            'numero_documento' => 'TS-001',
            'created_at' => '2026-01-02 03:04:05',
            'updated_at' => '2026-02-03 04:05:06',
        ]);
        DB::table('archivos')->insert([
            'nombre_original' => 'prueba.jpg',
            'nombre_almacenado' => 'prueba.jpg',
            'ruta' => 'pruebas/prueba.jpg',
            'disco' => 'local',
            'tipo_mime' => 'image/jpeg',
            'tamano' => 10,
            'created_at' => '2026-03-04 05:06:07',
            'updated_at' => '2026-03-04 05:06:07',
        ]);
        $migracion = require database_path('migrations/2026_11_12_230626_standardize_sigra_timestamps.php');

        $migracion->down();

        $productorAnterior = DB::table('productores')->where('numero_documento', 'TS-001')->first();
        $this->assertSame('2026-01-02 03:04:05', $productorAnterior->fecha_creacion);
        $this->assertSame('2026-02-03 04:05:06', $productorAnterior->fecha_actualizacion);
        $this->assertSame('2026-03-04 05:06:07', DB::table('archivos')->value('fecha_creacion'));

        $migracion->up();

        $productorActual = DB::table('productores')->where('numero_documento', 'TS-001')->first();
        $this->assertSame('2026-01-02 03:04:05', $productorActual->created_at);
        $this->assertSame('2026-02-03 04:05:06', $productorActual->updated_at);
        $this->assertSame('2026-03-04 05:06:07', DB::table('archivos')->value('created_at'));
        $this->assertSame('2026-03-04 05:06:07', DB::table('archivos')->value('updated_at'));
    }

    public function test_eloquent_actualiza_updated_at_automaticamente(): void
    {
        $this->travelTo('2026-04-05 06:07:08');
        $productor = Productor::query()->create([
            'nombres' => 'Ana',
            'apellidos' => 'Rural',
            'tipo_documento' => 'Cédula de ciudadanía',
            'numero_documento' => '987654',
        ]);

        $this->assertSame('2026-04-05 06:07:08', $productor->created_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-04-05 06:07:08', $productor->updated_at->format('Y-m-d H:i:s'));

        $this->travelTo('2026-04-05 07:08:09');
        $productor->update(['telefono' => '3000000000']);

        $this->assertSame('2026-04-05 07:08:09', $productor->fresh()->updated_at->format('Y-m-d H:i:s'));
    }

    public function test_la_migracion_traslada_todos_los_campos_temporales_sin_duplicar_visitas(): void
    {
        $visita = VisitaExtensionismo::query()->create([
            'estado' => 'borrador',
        ]);
        $eliminarColumnas = require database_path('migrations/2026_11_13_132031_drop_campos_borrador_from_visitas_extensionismo_table.php');
        $eliminarColumnas->down();
        DB::table('visitas_extensionismo')->where('visita_extensionismo', $visita->getKey())->update([
            'nombres_productor_borrador' => 'Ana',
            'apellidos_productor_borrador' => 'Rural',
            'tipo_documento_borrador' => 'Cédula de ciudadanía',
            'numero_documento_borrador' => '123456',
            'telefono_productor_borrador' => '3001234567',
            'sexo_productor_borrador' => 'Femenino',
            'nombre_predio_borrador' => 'El Porvenir',
            'divipola_borrador' => 1,
            'corregimiento_borrador' => 2,
            'vereda_borrador' => 3,
            'latitud_borrador' => 6.1234567,
            'longitud_borrador' => -72.395,
        ]);
        $migracion = require database_path('migrations/2026_11_13_132030_migrate_campos_borrador_to_visitas_borradores.php');

        $migracion->up();
        $migracion->up();

        $this->assertDatabaseHas('visitas_borradores', [
            'visita_extensionismo' => $visita->getKey(),
            'nombres_productor' => 'Ana',
            'apellidos_productor' => 'Rural',
            'tipo_documento' => 'Cédula de ciudadanía',
            'numero_documento' => '123456',
            'telefono_productor' => '3001234567',
            'sexo_productor' => 'Femenino',
            'nombre_predio' => 'El Porvenir',
            'divipola' => 1,
            'corregimiento' => 2,
            'vereda' => 3,
            'latitud' => 6.1234567,
            'longitud' => -72.395,
        ]);
        $this->assertSame(1, DB::table('visitas_borradores')->where('visita_extensionismo', $visita->getKey())->count());

        $eliminarColumnas->up();
        $this->assertFalse(Schema::hasColumn('visitas_extensionismo', 'nombres_productor_borrador'));
    }
}
