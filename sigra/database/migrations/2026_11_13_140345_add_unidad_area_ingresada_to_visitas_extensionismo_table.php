<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('visitas_extensionismo', function (Blueprint $table): void {
            $table->string('unidad_area_ingresada', 12)->nullable()->after('area_hectareas');
            $table->decimal('area_hectareas', 16, 6)->nullable()->change();
        });

        DB::table('visitas_extensionismo')
            ->whereNotNull('area_hectareas')
            ->whereNull('unidad_area_ingresada')
            ->update(['unidad_area_ingresada' => 'hectareas']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitas_extensionismo', function (Blueprint $table): void {
            $table->decimal('area_hectareas', 12, 2)->nullable()->change();
            $table->dropColumn('unidad_area_ingresada');
        });
    }
};
