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
        Schema::create('visitas_borradores', function (Blueprint $table): void {
            $table->bigIncrements('visita_borrador');
            $table->unsignedBigInteger('visita_extensionismo')->unique();
            $table->string('nombres_productor', 150)->nullable();
            $table->string('apellidos_productor', 150)->nullable();
            $table->string('tipo_documento', 20)->nullable();
            $table->string('numero_documento', 30)->nullable();
            $table->string('telefono_productor', 30)->nullable();
            $table->string('sexo_productor', 20)->nullable();
            $table->string('nombre_predio', 250)->nullable();
            $table->unsignedBigInteger('divipola')->nullable();
            $table->unsignedBigInteger('corregimiento')->nullable();
            $table->unsignedBigInteger('vereda')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->timestamps();

            $table->foreign('visita_extensionismo')
                ->references('visita_extensionismo')
                ->on('visitas_extensionismo')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitas_borradores');
    }
};
