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
        Schema::create('versiones_auditoria', function (Blueprint $table) {
            $table->bigIncrements('version_auditoria');
            $table->string('entidad', 100);
            $table->unsignedBigInteger('registro');
            $table->unsignedInteger('numero_version');
            $table->string('accion', 50);
            $table->unsignedBigInteger('usuario')->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();

            $table->foreign('usuario')->references('id')->on('users')->nullOnDelete();
            $table->unique(['entidad', 'registro', 'numero_version']);
            $table->index(['entidad', 'registro']);
        });

        Schema::create('cambios_auditoria', function (Blueprint $table) {
            $table->bigIncrements('cambio_auditoria');
            $table->unsignedBigInteger('version_auditoria');
            $table->string('campo', 150);
            $table->text('valor_anterior')->nullable();
            $table->text('valor_nuevo')->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();

            $table->foreign('version_auditoria')->references('version_auditoria')->on('versiones_auditoria')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cambios_auditoria');
        Schema::dropIfExists('versiones_auditoria');
    }
};
