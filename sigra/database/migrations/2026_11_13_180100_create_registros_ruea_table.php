<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registros_ruea', function (Blueprint $table): void {
            $table->bigIncrements('registro_ruea');
            $table->unsignedBigInteger('productor')->nullable();
            $table->unsignedBigInteger('predio')->nullable();
            $table->unsignedBigInteger('usuario');
            $table->date('fecha_registro')->nullable();
            $table->string('estado', 20)->default('borrador');
            $table->text('observaciones')->nullable();
            $table->string('nombre_extensionista')->nullable();
            $table->string('numero_documento_extensionista')->nullable();
            $table->string('perfil_extensionista')->nullable();
            $table->timestamp('fecha_finalizacion')->nullable();
            $table->timestamps();

            $table->foreign('productor')->references('productor')->on('productores')->nullOnDelete();
            $table->foreign('predio')->references('predio')->on('predios')->nullOnDelete();
            $table->foreign('usuario')->references('id')->on('users')->restrictOnDelete();
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_ruea');
    }
};
