<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('archivos', function (Blueprint $table) {
            $table->bigIncrements('archivo');
            $table->string('nombre_original', 255);
            $table->string('nombre_almacenado', 255);
            $table->string('ruta', 500);
            $table->string('disco', 100);
            $table->string('tipo_mime', 150);
            $table->unsignedBigInteger('tamano');
            $table->timestamp('fecha_creacion')->useCurrent();
        });

        Schema::create('anexos', function (Blueprint $table) {
            $table->bigIncrements('anexo');
            $table->unsignedBigInteger('archivo');
            $table->string('entidad', 100);
            $table->unsignedBigInteger('registro');
            $table->string('tipo_anexo', 100);
            $table->timestamp('fecha_creacion')->useCurrent();

            $table->foreign('archivo')->references('archivo')->on('archivos')->cascadeOnDelete();
            $table->index(['entidad', 'registro']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anexos');
        Schema::dropIfExists('archivos');
    }
};
