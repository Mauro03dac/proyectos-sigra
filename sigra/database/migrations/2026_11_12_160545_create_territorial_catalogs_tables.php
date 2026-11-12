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
        Schema::create('divipolas', function (Blueprint $table) {
            $table->bigIncrements('divipola');
            $table->string('codigo_departamento', 2);
            $table->string('nombre_departamento', 100);
            $table->string('codigo_municipio', 5)->unique();
            $table->string('nombre_municipio', 150);
            $table->string('tipo_municipio', 100)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();
        });

        Schema::create('corregimientos', function (Blueprint $table) {
            $table->bigIncrements('corregimiento');
            $table->unsignedBigInteger('divipola');
            $table->string('nombre', 150);
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('divipola')->references('divipola')->on('divipolas')->restrictOnDelete();
            $table->unique(['divipola', 'nombre']);
        });

        Schema::create('veredas', function (Blueprint $table) {
            $table->bigIncrements('vereda');
            $table->unsignedBigInteger('corregimiento');
            $table->string('nombre', 200);
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('corregimiento')->references('corregimiento')->on('corregimientos')->restrictOnDelete();
            $table->unique(['corregimiento', 'nombre']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('veredas');
        Schema::dropIfExists('corregimientos');
        Schema::dropIfExists('divipolas');
    }
};
