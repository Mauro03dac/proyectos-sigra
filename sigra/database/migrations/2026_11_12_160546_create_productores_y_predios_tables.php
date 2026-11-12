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
        Schema::create('productores', function (Blueprint $table) {
            $table->bigIncrements('productor');
            $table->string('nombres', 150);
            $table->string('apellidos', 150);
            $table->string('tipo_documento', 20);
            $table->string('numero_documento', 30);
            $table->string('telefono', 30)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->string('sexo', 20)->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->unique(['tipo_documento', 'numero_documento']);
        });

        Schema::create('predios', function (Blueprint $table) {
            $table->bigIncrements('predio');
            $table->unsignedBigInteger('productor');
            $table->string('nombre', 250);
            $table->unsignedBigInteger('divipola');
            $table->unsignedBigInteger('corregimiento')->nullable();
            $table->unsignedBigInteger('vereda')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->decimal('hectareas', 12, 2)->nullable();
            $table->decimal('altitud_msnm', 10, 2)->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent();

            $table->foreign('productor')->references('productor')->on('productores')->restrictOnDelete();
            $table->foreign('divipola')->references('divipola')->on('divipolas')->restrictOnDelete();
            $table->foreign('corregimiento')->references('corregimiento')->on('corregimientos')->nullOnDelete();
            $table->foreign('vereda')->references('vereda')->on('veredas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predios');
        Schema::dropIfExists('productores');
    }
};
