<?php

use App\Support\Catalogos\CargadorCatalogosIniciales;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(CargadorCatalogosIniciales::class)->cargarTodos();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Los catálogos pueden haberse ajustado operativamente después de su instalación.
    }
};
