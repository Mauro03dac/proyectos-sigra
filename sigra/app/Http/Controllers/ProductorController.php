<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActualizarProductorRequest;
use App\Models\Productor;
use App\Servicios\ServicioAuditoria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ProductorController extends Controller
{
    public function index(Request $request): Response
    {
        $productores = Productor::query()->when($request->filled('nombre'), fn ($q) => $q->where(fn ($q) => $q->where('nombres', 'like', '%'.$request->string('nombre')->toString().'%')->orWhere('apellidos', 'like', '%'.$request->string('nombre')->toString().'%')))->when($request->filled('documento'), fn ($q) => $q->where('numero_documento', 'like', '%'.$request->string('documento')->toString().'%'))->orderBy('nombres')->paginate(10)->withQueryString();

        return Inertia::render('productores/listado', ['productores' => $productores->getCollection()->map(fn (Productor $p) => $this->presentar($p))->all(), 'paginacion' => ['paginaActual' => $productores->currentPage(), 'ultimaPagina' => $productores->lastPage(), 'total' => $productores->total()], 'filtros' => $request->only(['nombre', 'documento']), 'totalProductores' => Productor::count()]);
    }

    public function edit(Productor $productor): Response
    {
        return Inertia::render('productores/editar', ['productor' => $this->presentar($productor)]);
    }

    public function update(ActualizarProductorRequest $request, Productor $productor, ServicioAuditoria $auditoria): RedirectResponse
    {
        $antes = $productor->only(['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'telefono', 'fecha_nacimiento']);
        $productor->fill($request->validated());
        $cambios = collect($productor->getDirty())->except(['fecha_actualizacion'])->map(fn ($nuevo, $campo) => ['anterior' => $antes[$campo] ?? null, 'nuevo' => $nuevo])->all();
        if ($cambios !== []) {
            $productor->save();
            $auditoria->registrar('productor', (int) $productor->getKey(), 'Actualización', (int) $request->user()->id, $cambios);
        }

        return to_route('productores.editar', $productor)->with('success', $cambios === [] ? 'No hay cambios para guardar.' : 'Productor actualizado correctamente.');
    }

    /** @return array<string, string> */
    private function presentar(Productor $p): array
    {
        $fechaNacimiento = $p->fecha_nacimiento ? Carbon::parse($p->fecha_nacimiento) : null;

        return ['id' => (string) $p->getKey(), 'nombres' => $p->nombres, 'apellidos' => $p->apellidos, 'nombreCompleto' => $p->nombre_completo, 'tipoDocumento' => $p->tipo_documento, 'numeroDocumento' => $p->numero_documento, 'telefono' => $p->telefono ?? '', 'fechaNacimiento' => $fechaNacimiento?->format('d/m/Y') ?? '', 'fechaNacimientoISO' => $fechaNacimiento?->format('Y-m-d') ?? ''];
    }
}
