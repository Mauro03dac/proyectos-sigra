<?php

use App\Http\Controllers\ProductorController;
use App\Http\Controllers\VisitaExtensionismoController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('visitas-extensionismo', [VisitaExtensionismoController::class, 'index'])->name('visitas-extensionismo.index');
    Route::get('visitas-extensionismo/crear', [VisitaExtensionismoController::class, 'create'])->name('visitas-extensionismo.crear');
    Route::post('visitas-extensionismo/borrador', [VisitaExtensionismoController::class, 'storeBorrador'])->name('visitas-extensionismo.borrador');
    Route::post('visitas-extensionismo', [VisitaExtensionismoController::class, 'store'])->name('visitas-extensionismo.store');
    Route::get('visitas-extensionismo/{visita}/editar', [VisitaExtensionismoController::class, 'edit'])->name('visitas-extensionismo.editar');
    Route::get('visitas-extensionismo/{visita}/fotografias/{anexo}', [VisitaExtensionismoController::class, 'fotografia'])->name('visitas-extensionismo.fotografia');
    Route::put('visitas-extensionismo/{visita}/borrador', [VisitaExtensionismoController::class, 'updateBorrador'])->name('visitas-extensionismo.borrador.actualizar');
    Route::put('visitas-extensionismo/{visita}', [VisitaExtensionismoController::class, 'update'])->name('visitas-extensionismo.update');
    Route::get('visitas-extensionismo/productores', [VisitaExtensionismoController::class, 'buscarProductores'])->name('visitas-extensionismo.productores.buscar');
    Route::inertia('registro-ruea', 'registro-ruea/listado')
        ->name('registro-ruea.index');
    Route::inertia('registro-ruea/crear', 'registro-ruea/crear')
        ->name('registro-ruea.crear');
    Route::inertia('registro-productor', 'registro-productor/listado')
        ->name('registro-productor.index');
    Route::inertia('registro-productor/crear', 'registro-productor/crear')
        ->name('registro-productor.crear');
    Route::get('productores', [ProductorController::class, 'index'])->name('productores.index');
    Route::get('productores/{productor}/editar', [ProductorController::class, 'edit'])->name('productores.editar');
    Route::put('productores/{productor}', [ProductorController::class, 'update'])->name('productores.update');
});

require __DIR__.'/settings.php';
