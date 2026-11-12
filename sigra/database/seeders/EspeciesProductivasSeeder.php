<?php

namespace Database\Seeders;

use App\Support\Catalogos\CargadorCatalogosIniciales;
use Illuminate\Database\Seeder;

class EspeciesProductivasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(CargadorCatalogosIniciales::class)->cargarEspeciesProductivas();
    }
}
