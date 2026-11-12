<?php

namespace Database\Seeders;

use App\Support\Catalogos\CargadorCatalogosIniciales;
use Illuminate\Database\Seeder;

class LineasProductivasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(CargadorCatalogosIniciales::class)->cargarLineasProductivas();
    }
}
