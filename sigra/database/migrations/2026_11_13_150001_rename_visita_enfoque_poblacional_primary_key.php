<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('visitas_enfoques_poblacionales', 'visita_enfoque_poblacional')) {
            Schema::table('visitas_enfoques_poblacionales', function (Blueprint $table): void {
                $table->renameColumn('visita_enfoque_poblacional', 'id_enfoque_poblacional');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('visitas_enfoques_poblacionales', 'id_enfoque_poblacional')) {
            Schema::table('visitas_enfoques_poblacionales', function (Blueprint $table): void {
                $table->renameColumn('id_enfoque_poblacional', 'visita_enfoque_poblacional');
            });
        }
    }
};
