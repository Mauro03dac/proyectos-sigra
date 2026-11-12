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
        Schema::table('visitas_extensionismo', function (Blueprint $table) {
            $table->string('nombres_productor_borrador', 150)->nullable();
            $table->string('apellidos_productor_borrador', 150)->nullable();
            $table->string('tipo_documento_borrador', 20)->nullable();
            $table->string('numero_documento_borrador', 30)->nullable();
            $table->string('telefono_productor_borrador', 30)->nullable();
            $table->string('sexo_productor_borrador', 20)->nullable();
            $table->string('nombre_predio_borrador', 250)->nullable();
            $table->unsignedBigInteger('divipola_borrador')->nullable();
            $table->unsignedBigInteger('corregimiento_borrador')->nullable();
            $table->unsignedBigInteger('vereda_borrador')->nullable();
            $table->decimal('latitud_borrador', 10, 7)->nullable();
            $table->decimal('longitud_borrador', 10, 7)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitas_extensionismo', function (Blueprint $table) {
            $table->dropColumn(['nombres_productor_borrador', 'apellidos_productor_borrador', 'tipo_documento_borrador', 'numero_documento_borrador', 'telefono_productor_borrador', 'sexo_productor_borrador', 'nombre_predio_borrador', 'divipola_borrador', 'corregimiento_borrador', 'vereda_borrador', 'latitud_borrador', 'longitud_borrador']);
        });
    }
};
