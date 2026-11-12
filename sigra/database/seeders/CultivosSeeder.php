<?php

namespace Database\Seeders;

use App\Support\Catalogos\CargadorCatalogosIniciales;
use Illuminate\Database\Seeder;

class CultivosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(CargadorCatalogosIniciales::class)->cargarCultivos();
    }
}
