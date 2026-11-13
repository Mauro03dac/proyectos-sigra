<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the approved MI10-F58 categories without removing the historical catalog.
     */
    public function up(): void
    {
        Schema::table('visitas_extensionismo', function (Blueprint $table): void {
            $table->text('linea_productiva_principal_otra')->nullable();
            $table->text('especie_productiva_otra')->nullable();
            $table->text('linea_productiva_secundaria_otra')->nullable();
        });

        $ahora = now();
        $lineas = [
            ['codigo' => 'AGRICOLA', 'nombre' => 'Agrícola', 'descripcion' => 'Categoría agrícola aprobada para MI10-F58'],
            ['codigo' => 'PECUARIO', 'nombre' => 'Pecuario', 'descripcion' => 'Categoría pecuaria aprobada para MI10-F58'],
            ['codigo' => 'OTRA', 'nombre' => 'Otra', 'descripcion' => 'Otra línea productiva aprobada para MI10-F58'],
        ];

        foreach ($lineas as $linea) {
            DB::table('lineas_productivas')->updateOrInsert(
                ['codigo' => $linea['codigo']],
                [...$linea, 'activo' => true, 'updated_at' => $ahora, 'created_at' => $ahora],
            );
        }

        $idsLineas = DB::table('lineas_productivas')->whereIn('codigo', ['AGRICOLA', 'PECUARIO'])->pluck('linea_productiva', 'codigo');
        $especies = [
            ['codigo' => 'MI10_CAFE', 'nombre' => 'Café', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_CACAO', 'nombre' => 'Cacao', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_PLATANO', 'nombre' => 'Plátano', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_MAIZ', 'nombre' => 'Maíz', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_SORGO', 'nombre' => 'Sorgo', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_ARROZ', 'nombre' => 'Arroz', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_YUCA', 'nombre' => 'Yuca', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_CANA', 'nombre' => 'Caña', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_PALMA_ACEITE', 'nombre' => 'Palma de aceite', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_REF_COMERCIAL', 'nombre' => 'Ref. comercial', 'grupo' => 'general', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_MANGO', 'nombre' => 'Mango', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_MARACUYA', 'nombre' => 'Maracuyá', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_PAPAYA', 'nombre' => 'Papaya', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_GUAYABA', 'nombre' => 'Guayaba', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_GUANABANA', 'nombre' => 'Guanábana', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_AGUACATE', 'nombre' => 'Aguacate', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_BANANO', 'nombre' => 'Banano', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_PATILLA', 'nombre' => 'Patilla', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_ZAPOTE', 'nombre' => 'Zapote', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_MAMONCILLO', 'nombre' => 'Mamoncillo', 'grupo' => 'frutal', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_LIMON', 'nombre' => 'Limón', 'grupo' => 'citrico', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_LIMA', 'nombre' => 'Lima', 'grupo' => 'citrico', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_NARANJA', 'nombre' => 'Naranja', 'grupo' => 'citrico', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_MANDARINA', 'nombre' => 'Mandarina', 'grupo' => 'citrico', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_PINA', 'nombre' => 'Piña', 'grupo' => 'otra', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_OTRA_AGRICOLA', 'nombre' => 'Otra', 'grupo' => 'otra', 'linea' => 'AGRICOLA'],
            ['codigo' => 'MI10_BOVINO', 'nombre' => 'Bovino', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
            ['codigo' => 'MI10_EQUINO', 'nombre' => 'Equino', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
            ['codigo' => 'MI10_PISCICOLA', 'nombre' => 'Piscícola', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
            ['codigo' => 'MI10_AVICOLA', 'nombre' => 'Avícola', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
            ['codigo' => 'MI10_PORCINO', 'nombre' => 'Porcino', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
            ['codigo' => 'MI10_OVINO', 'nombre' => 'Ovino', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
            ['codigo' => 'MI10_OTRA_PECUARIO', 'nombre' => 'Otra', 'grupo' => 'pecuario', 'linea' => 'PECUARIO'],
        ];

        foreach ($especies as $especie) {
            DB::table('especies_productivas')->updateOrInsert(
                ['codigo' => $especie['codigo']],
                [
                    'linea_productiva' => $idsLineas[$especie['linea']],
                    'nombre' => $especie['nombre'],
                    'grupo' => $especie['grupo'],
                    'activo' => true,
                    'updated_at' => $ahora,
                    'created_at' => $ahora,
                ],
            );
        }
    }

    /**
     * Reverse only the columns and canonical rows introduced by this migration.
     */
    public function down(): void
    {
        Schema::table('visitas_extensionismo', function (Blueprint $table): void {
            $table->dropColumn([
                'linea_productiva_principal_otra',
                'especie_productiva_otra',
                'linea_productiva_secundaria_otra',
            ]);
        });

        DB::table('especies_productivas')->where('codigo', 'like', 'MI10_%')->delete();
        DB::table('lineas_productivas')->whereIn('codigo', ['AGRICOLA', 'PECUARIO', 'OTRA'])->delete();
    }
};
