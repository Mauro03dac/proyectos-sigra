<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('visitas-extensionismo', 'visitas-extensionismo/listado')
        ->name('visitas-extensionismo.index');
    Route::inertia('visitas-extensionismo/crear', 'visitas-extensionismo/crear')
        ->name('visitas-extensionismo.crear');
    Route::inertia('registro-ruea', 'registro-ruea/listado')
        ->name('registro-ruea.index');
    Route::inertia('registro-ruea/crear', 'registro-ruea/crear')
        ->name('registro-ruea.crear');
    Route::inertia('registro-productor', 'registro-productor/listado')
        ->name('registro-productor.index');
    Route::inertia('registro-productor/crear', 'registro-productor/crear')
        ->name('registro-productor.crear');
    Route::inertia('productores', 'productores/listado')
        ->name('productores.index');
    Route::get('productores/{productor}/editar', function (string $productor) {
        return Inertia::render('productores/editar', [
            'productorId' => $productor,
        ]);
    })->name('productores.editar');
});

require __DIR__.'/settings.php';
