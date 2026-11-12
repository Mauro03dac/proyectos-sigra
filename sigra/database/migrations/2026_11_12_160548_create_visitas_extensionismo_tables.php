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
        Schema::create('visitas_extensionismo', function (Blueprint $table) {
            $table->bigIncrements('visita_extensionismo');
            $table->unsignedBigInteger('productor')->nullable();
            $table->unsignedBigInteger('predio')->nullable();
            $table->date('fecha_visita')->nullable();
            $table->string('estado', 20)->default('borrador');
            $table->timestamp('fecha_registro')->nullable();
            $table->unsignedBigInteger('linea_productiva_principal')->nullable();
            $table->unsignedBigInteger('linea_productiva_secundaria')->nullable();
            $table->unsignedBigInteger('especie_productiva')->nullable();
            $table->integer('numero_animales')->nullable();
            $table->decimal('area_hectareas', 12, 2)->nullable();
            $table->string('tipo_discapacidad', 255)->nullable();
            $table->boolean('victima_conflicto_armado')->nullable();
            $table->boolean('afiliado_sisben')->nullable();
            $table->decimal('puntaje_sisben', 6, 2)->nullable();
            $table->boolean('afiliado_asociacion')->nullable();
            $table->text('nombre_asociacion')->nullable();
            $table->text('aspecto_visita')->nullable();
            $table->text('componente_visita')->nullable();
            $table->text('diagnostico')->nullable();
            $table->text('actividades_realizadas')->nullable();
            $table->text('principales_proveedores')->nullable();
            $table->text('principales_compradores')->nullable();
            $table->text('fuentes_consulta')->nullable();
            $table->text('recomendaciones')->nullable();
            $table->text('compromisos')->nullable();
            $table->unsignedBigInteger('usuario')->nullable();
            $table->string('nombre_extensionista', 300)->nullable();
            $table->string('numero_documento_extensionista', 30)->nullable();
            $table->string('disciplina_extensionista', 150)->nullable();
            $table->string('titulo_academico_extensionista', 200)->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('productor')->references('productor')->on('productores')->nullOnDelete();
            $table->foreign('predio')->references('predio')->on('predios')->nullOnDelete();
            $table->foreign('linea_productiva_principal')->references('linea_productiva')->on('lineas_productivas')->nullOnDelete();
            $table->foreign('linea_productiva_secundaria')->references('linea_productiva')->on('lineas_productivas')->nullOnDelete();
            $table->foreign('especie_productiva')->references('especie_productiva')->on('especies_productivas')->nullOnDelete();
            $table->foreign('usuario')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('visitas_enfoques_poblacionales', function (Blueprint $table) {
            $table->bigIncrements('visita_enfoque_poblacional');
            $table->unsignedBigInteger('visita_extensionismo');
            $table->unsignedBigInteger('enfoque_poblacional');
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('visita_extensionismo')->references('visita_extensionismo')->on('visitas_extensionismo')->cascadeOnDelete();
            $table->foreign('enfoque_poblacional')->references('enfoque_poblacional')->on('enfoques_poblacionales')->restrictOnDelete();
            $table->unique(['visita_extensionismo', 'enfoque_poblacional']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitas_enfoques_poblacionales');
        Schema::dropIfExists('visitas_extensionismo');
    }
};
