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
        Schema::create('enfoques_poblacionales', function (Blueprint $table) {
            $table->bigIncrements('enfoque_poblacional');
            $table->string('codigo', 100)->unique();
            $table->string('nombre', 150);
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();
        });

        Schema::create('lineas_productivas', function (Blueprint $table) {
            $table->bigIncrements('linea_productiva');
            $table->string('codigo', 100)->unique();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();
        });

        Schema::create('especies_productivas', function (Blueprint $table) {
            $table->bigIncrements('especie_productiva');
            $table->unsignedBigInteger('linea_productiva');
            $table->string('codigo', 100)->unique();
            $table->string('nombre', 150);
            $table->string('grupo', 50);
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('linea_productiva')->references('linea_productiva')->on('lineas_productivas')->restrictOnDelete();
        });

        Schema::create('cultivos', function (Blueprint $table) {
            $table->bigIncrements('cultivo');
            $table->unsignedBigInteger('linea_productiva');
            $table->string('codigo', 100)->unique();
            $table->string('nombre', 150);
            $table->string('grupo', 50);
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('linea_productiva')->references('linea_productiva')->on('lineas_productivas')->restrictOnDelete();
        });

        Schema::create('razas_pecuarias', function (Blueprint $table) {
            $table->bigIncrements('raza_pecuaria');
            $table->string('codigo', 100)->unique();
            $table->string('grupo', 50);
            $table->string('nombre', 150);
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('razas_pecuarias');
        Schema::dropIfExists('cultivos');
        Schema::dropIfExists('especies_productivas');
        Schema::dropIfExists('lineas_productivas');
        Schema::dropIfExists('enfoques_poblacionales');
    }
};
