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
        foreach ($this->tablesWithBothTimestamps() as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->renameColumn('fecha_creacion', 'created_at');
                $table->renameColumn('fecha_actualizacion', 'updated_at');
            });
        }

        foreach ($this->tablesWithCreationTimestampOnly() as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->renameColumn('fecha_creacion', 'created_at');
                $table->timestamp('updated_at')->nullable();
            });

            DB::table($tableName)->update(['updated_at' => DB::raw('created_at')]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (array_reverse($this->tablesWithCreationTimestampOnly()) as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('updated_at');
                $table->renameColumn('created_at', 'fecha_creacion');
            });
        }

        foreach (array_reverse($this->tablesWithBothTimestamps()) as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->renameColumn('created_at', 'fecha_creacion');
                $table->renameColumn('updated_at', 'fecha_actualizacion');
            });
        }
    }

    /** @return array<int, string> */
    private function tablesWithBothTimestamps(): array
    {
        return [
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
        ];
    }

    /** @return array<int, string> */
    private function tablesWithCreationTimestampOnly(): array
    {
        return [
            'archivos',
            'anexos',
            'versiones_auditoria',
            'cambios_auditoria',
        ];
    }
};
