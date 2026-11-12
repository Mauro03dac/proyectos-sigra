<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuardarBorradorVisitaRequest;
use App\Http\Requests\GuardarVisitaRequest;
use App\Models\Anexo;
use App\Models\Corregimiento;
use App\Models\Divipola;
use App\Models\EnfoquePoblacional;
use App\Models\EspecieProductiva;
use App\Models\LineaProductiva;
use App\Models\Predio;
use App\Models\Productor;
use App\Models\User;
use App\Models\Vereda;
use App\Models\VersionAuditoria;
use App\Models\VisitaExtensionismo;
use App\Servicios\ServicioVisitasExtensionismo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VisitaExtensionismoController extends Controller
{
    public function index(Request $request): Response
    {
        $consulta = VisitaExtensionismo::query()->with(['productor', 'predio.vereda', 'usuarioResponsable'])
            ->when($request->filled('buscar'), function ($q) use ($request): void {
                $texto = $request->string('buscar')->toString();
                $q->where(function ($q) use ($texto): void {
                    $q->where('visita_extensionismo', 'like', "%{$texto}%")
                        ->orWhereHas('productor', fn ($p) => $p->where('nombres', 'like', "%{$texto}%")->orWhere('apellidos', 'like', "%{$texto}%"))
                        ->orWhereHas('predio', fn ($p) => $p->where('nombre', 'like', "%{$texto}%"));
                });
            })
            ->when($request->filled('desde'), fn ($q) => $q->whereDate('fecha_visita', '>=', $request->string('desde')->toString()))
            ->when($request->filled('hasta'), fn ($q) => $q->whereDate('fecha_visita', '<=', $request->string('hasta')->toString()))
            ->latest('visita_extensionismo');
        $paginadas = $consulta->paginate(10)->withQueryString();
        $ids = $paginadas->getCollection()->pluck('visita_extensionismo');
        $historial = VersionAuditoria::query()->with(['cambios', 'usuarioResponsable'])->where('entidad', 'visita_extensionismo')->whereIn('registro', $ids)->latest('numero_version')->get()->groupBy('registro')->map(fn ($versiones) => $versiones->map(function ($version): array {
            $usuario = $version->usuarioResponsable()->first();

            return ['id' => (string) $version->numero_version, 'numero' => (int) $version->numero_version, 'fechaHora' => Carbon::parse($version->fecha_creacion)->format('d/m/Y H:i'), 'usuario' => $usuario ? $usuario->name : 'Usuario no disponible', 'operacion' => $version->accion, 'cambios' => $version->cambios->map(fn ($cambio) => ['campo' => $cambio->campo, 'etiqueta' => $this->etiquetaCampo($cambio->campo), 'anterior' => $cambio->valor_anterior ?? 'Sin valor', 'nuevo' => $cambio->valor_nuevo ?? 'Sin valor'])->all()];
        })->all())->all();

        return Inertia::render('visitas-extensionismo/listado', ['visitas' => $paginadas->getCollection()->map(fn (VisitaExtensionismo $v) => $this->resumen($v))->all(), 'paginacion' => ['paginaActual' => $paginadas->currentPage(), 'ultimaPagina' => $paginadas->lastPage(), 'total' => $paginadas->total()], 'historialTrazabilidad' => $historial, 'filtros' => $request->only(['buscar', 'desde', 'hasta']), 'indicadores' => ['total' => VisitaExtensionismo::count(), 'borradores' => VisitaExtensionismo::where('estado', 'borrador')->count(), 'veredas' => VisitaExtensionismo::query()->whereNotNull('visitas_extensionismo.predio')->join('predios', 'predios.predio', '=', 'visitas_extensionismo.predio')->distinct('predios.vereda')->count('predios.vereda')]]);
    }

    public function create(): Response
    {
        return Inertia::render('visitas-extensionismo/crear', $this->catalogos());
    }

    public function edit(VisitaExtensionismo $visita): Response
    {
        $visita->load(['productor', 'predio.divipola', 'predio.corregimiento', 'predio.vereda', 'enfoquesPoblacionales', 'anexos.archivo']);

        return Inertia::render('visitas-extensionismo/crear', [...$this->catalogos(), 'visita' => $this->formulario($visita)]);
    }

    public function fotografia(VisitaExtensionismo $visita, Anexo $anexo): StreamedResponse
    {
        abort_unless($anexo->entidad === 'visita_extensionismo' && (int) $anexo->registro === (int) $visita->getKey() && $anexo->tipo_anexo === 'fotografia', 404);
        $archivo = $anexo->archivo()->firstOrFail();

        return Storage::disk($archivo->disco)->response($archivo->ruta, $archivo->nombre_original, ['Content-Type' => $archivo->tipo_mime]);
    }

    public function storeBorrador(GuardarBorradorVisitaRequest $request, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        $visita = $servicio->guardar($request->validated(), (int) $request->user()->id, false);

        return to_route('visitas-extensionismo.editar', $visita)->with('success', 'Borrador guardado correctamente.');
    }

    public function store(GuardarVisitaRequest $request, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        $servicio->guardar($request->validated(), (int) $request->user()->id, true);

        return to_route('visitas-extensionismo.index')->with('success', 'Visita guardada correctamente.');
    }

    public function updateBorrador(GuardarBorradorVisitaRequest $request, VisitaExtensionismo $visita, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        $servicio->guardar($request->validated(), (int) $request->user()->id, false, $visita);

        return to_route('visitas-extensionismo.editar', $visita)->with('success', 'Borrador actualizado correctamente.');
    }

    public function update(GuardarVisitaRequest $request, VisitaExtensionismo $visita, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        $servicio->guardar($request->validated(), (int) $request->user()->id, true, $visita);

        return to_route('visitas-extensionismo.index')->with('success', 'Visita actualizada correctamente.');
    }

    public function buscarProductores(Request $request): JsonResponse
    {
        $documento = trim($request->string('numero_documento')->toString());
        $nombres = trim($request->string('nombres')->toString());
        $apellidos = trim($request->string('apellidos')->toString());
        if (mb_strlen($documento) < 2 && mb_strlen($nombres) < 2 && mb_strlen($apellidos) < 2) {
            return response()->json([]);
        }

        return response()->json(Productor::query()->with(['predios.divipola', 'predios.corregimiento', 'predios.vereda'])->when($documento !== '' && $nombres === '' && $apellidos === '', fn ($q) => $q->where(fn ($q) => $q->where('numero_documento', 'like', "%{$documento}%")->orWhere('nombres', 'like', "%{$documento}%")->orWhere('apellidos', 'like', "%{$documento}%")))->when($documento !== '' && ($nombres !== '' || $apellidos !== ''), fn ($q) => $q->where('numero_documento', 'like', "%{$documento}%"))->when($nombres !== '', fn ($q) => $q->where('nombres', 'like', "%{$nombres}%"))->when($apellidos !== '', fn ($q) => $q->where('apellidos', 'like', "%{$apellidos}%"))->limit(10)->get());
    }

    /** @return array<string, string> */
    private function resumen(VisitaExtensionismo $v): array
    {
        $productor = $v->getRelation('productor');
        $predio = $v->getRelation('predio');
        $usuario = $v->getRelation('usuarioResponsable');
        $vereda = $predio instanceof Predio ? $predio->getRelation('vereda') : null;

        return ['numero' => (string) $v->getKey(), 'productor' => $productor instanceof Productor ? $productor->nombre_completo : trim("{$v->nombres_productor_borrador} {$v->apellidos_productor_borrador}"), 'extensionista' => $v->nombre_extensionista ?? ($usuario instanceof User ? $usuario->name : 'Sin asignar'), 'fecha' => $v->fecha_visita ? Carbon::parse($v->fecha_visita)->format('d/m/Y') : 'Sin fecha', 'vereda' => $vereda instanceof Vereda ? $vereda->nombre : '', 'estado' => $v->estado === 'borrador' ? 'Borrador' : 'Registrada'];
    }

    /** @return array<string, mixed> */
    private function formulario(VisitaExtensionismo $v): array
    {
        $productor = $this->productorDe($v);
        $predio = $this->predioDe($v);

        return ['id' => $v->getKey(), 'estado' => $v->estado, 'campos' => [...$v->only(['fecha_visita', 'linea_productiva_principal', 'linea_productiva_secundaria', 'especie_productiva', 'numero_animales', 'area_hectareas', 'tipo_discapacidad', 'victima_conflicto_armado', 'afiliado_sisben', 'puntaje_sisben', 'afiliado_asociacion', 'nombre_asociacion', 'aspecto_visita', 'componente_visita', 'diagnostico', 'actividades_realizadas', 'principales_proveedores', 'principales_compradores', 'fuentes_consulta', 'recomendaciones', 'compromisos', 'nombre_extensionista', 'numero_documento_extensionista', 'disciplina_extensionista', 'titulo_academico_extensionista']), 'nombres' => $productor ? $productor->nombres : $v->nombres_productor_borrador, 'apellidos' => $productor ? $productor->apellidos : $v->apellidos_productor_borrador, 'tipo_documento' => $productor ? $productor->tipo_documento : $v->tipo_documento_borrador, 'numero_documento' => $productor ? $productor->numero_documento : $v->numero_documento_borrador, 'telefono' => $productor ? $productor->telefono : $v->telefono_productor_borrador, 'sexo' => $productor ? $productor->sexo : $v->sexo_productor_borrador, 'productor_existente' => $productor ? $productor->getKey() : null, 'predio_existente' => $predio ? $predio->getKey() : null, 'nombre_predio' => $predio ? $predio->nombre : $v->nombre_predio_borrador, 'divipola' => $predio ? $predio->divipola : $v->divipola_borrador, 'corregimiento' => $predio ? $predio->corregimiento : $v->corregimiento_borrador, 'vereda' => $predio ? $predio->vereda : $v->vereda_borrador, 'latitud' => $predio ? $predio->latitud : $v->latitud_borrador, 'longitud' => $predio ? $predio->longitud : $v->longitud_borrador, 'enfoques_poblacionales' => $v->enfoquesPoblacionales->pluck('enfoque_poblacional')->all(), 'fotografias' => $v->anexos->map(fn ($a) => ['id' => $a->getKey(), 'nombre' => $a->archivo()->first()->nombre_original])->all()]];
    }

    /** @return array<string, mixed> */
    private function catalogos(): array
    {
        return ['divipolas' => Divipola::query()->orderBy('nombre_municipio')->get(['divipola', 'codigo_departamento', 'nombre_departamento', 'codigo_municipio', 'nombre_municipio']), 'corregimientos' => Corregimiento::query()->orderBy('nombre')->get(['corregimiento', 'divipola', 'nombre']), 'veredas' => Vereda::query()->orderBy('nombre')->get(['vereda', 'corregimiento', 'nombre']), 'lineasProductivas' => LineaProductiva::query()->where('activo', true)->orderBy('nombre')->get(['linea_productiva', 'nombre']), 'especiesProductivas' => EspecieProductiva::query()->where('activo', true)->orderBy('nombre')->get(['especie_productiva', 'linea_productiva', 'nombre']), 'enfoquesPoblacionales' => EnfoquePoblacional::query()->where('activo', true)->orderBy('nombre')->get(['enfoque_poblacional', 'nombre'])];
    }

    private function etiquetaCampo(string $campo): string
    {
        return ['diagnostico' => 'Diagnóstico', 'recomendaciones' => 'Recomendaciones', 'compromisos' => 'Compromisos', 'actividades_realizadas' => 'Actividades realizadas', 'enfoques_poblacionales' => 'Enfoques poblacionales', 'productor' => 'Productor', 'predio' => 'Predio', 'estado' => 'Estado'][$campo] ?? str_replace('_', ' ', ucfirst($campo));
    }

    private function productorDe(VisitaExtensionismo $visita): ?Productor
    {
        $id = $visita->getAttribute('productor');
        if ($id === null) {
            return null;
        }

        return Productor::query()->where('productor', $id)->firstOrFail();
    }

    private function predioDe(VisitaExtensionismo $visita): ?Predio
    {
        $id = $visita->getAttribute('predio');
        if ($id === null) {
            return null;
        }

        return Predio::query()->where('predio', $id)->firstOrFail();
    }
}
