<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActualizarProductorRequest;
use App\Models\Productor;
use App\Models\VersionAuditoria;
use App\Servicios\ServicioAuditoria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ProductorController extends Controller
{
    public function index(Request $request): Response
    {
        $productores = Productor::query()->when($request->filled('nombre'), fn ($q) => $q->where(fn ($q) => $q->where('nombres', 'like', '%'.$request->string('nombre')->toString().'%')->orWhere('apellidos', 'like', '%'.$request->string('nombre')->toString().'%')))->when($request->filled('documento'), fn ($q) => $q->where('numero_documento', 'like', '%'.$request->string('documento')->toString().'%'))->orderBy('nombres')->paginate(10)->withQueryString();

        $ids = $productores->getCollection()->pluck('productor');

        return Inertia::render('productores/listado', ['productores' => $productores->getCollection()->map(fn (Productor $p) => $this->presentar($p))->all(), 'paginacion' => ['paginaActual' => $productores->currentPage(), 'ultimaPagina' => $productores->lastPage(), 'total' => $productores->total()], 'filtros' => $request->only(['nombre', 'documento']), 'totalProductores' => Productor::count(), 'historialTrazabilidad' => $this->historialDe($ids)]);
    }

    public function edit(Productor $productor): Response
    {
        return Inertia::render('productores/editar', ['productor' => $this->presentar($productor)]);
    }

    public function update(ActualizarProductorRequest $request, Productor $productor, ServicioAuditoria $auditoria): RedirectResponse
    {
        $antes = $productor->only(['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'telefono', 'fecha_nacimiento']);
        $productor->fill($request->validated());
        $cambios = collect($productor->getDirty())->except(['updated_at'])->map(fn ($nuevo, $campo) => ['anterior' => $antes[$campo] ?? null, 'nuevo' => $nuevo])->all();
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

        return ['id' => (string) $p->getKey(), 'nombres' => $p->nombres, 'apellidos' => $p->apellidos, 'nombreCompleto' => $p->nombre_completo, 'tipoDocumento' => $p->tipo_documento, 'numeroDocumento' => $p->numero_documento, 'telefono' => $p->telefono ?? '', 'fechaNacimiento' => $fechaNacimiento?->format('d/m/Y') ?? '', 'fechaNacimientoISO' => $fechaNacimiento?->format('Y-m-d') ?? '', 'fechaRegistro' => Carbon::parse($p->created_at)->format('d/m/Y')];
    }

    /** @param Collection<int, mixed> $ids */
    private function historialDe(Collection $ids): array
    {
        return VersionAuditoria::query()->with(['cambios', 'usuarioResponsable'])->where('entidad', 'productor')->whereIn('registro', $ids)->latest('numero_version')->get()->groupBy('registro')->map(fn ($versiones) => $versiones->map(function ($version): array {
            $usuario = $version->getRelation('usuarioResponsable');

            return ['id' => (string) $version->numero_version, 'numero' => (int) $version->numero_version, 'fechaHora' => Carbon::parse($version->created_at)->format('d/m/Y H:i'), 'usuario' => $usuario?->name ?? 'Usuario no disponible', 'operacion' => $version->accion, 'cambios' => $version->cambios->map(fn ($cambio) => ['campo' => $cambio->campo, 'etiqueta' => str_replace('_', ' ', ucfirst($cambio->campo)), 'anterior' => $cambio->valor_anterior ?? 'Sin valor', 'nuevo' => $cambio->valor_nuevo ?? 'Sin valor'])->all()];
        })->all())->all();
    }
}
