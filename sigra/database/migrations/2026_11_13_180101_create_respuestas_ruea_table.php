<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('respuestas_ruea', function (Blueprint $table): void {
            $table->bigIncrements('respuesta_ruea');
            $table->unsignedBigInteger('registro_ruea');
            $table->string('campo', 10);
            $table->smallInteger('valor');

            $table->unique(['registro_ruea', 'campo']);
            $table->foreign('registro_ruea')->references('registro_ruea')->on('registros_ruea')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respuestas_ruea');
    }
};
