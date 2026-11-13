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
use App\Servicios\ServicioAuditoria;
use App\Servicios\ServicioVisitasExtensionismo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class VisitaExtensionismoController extends Controller
{
    private const MENSAJE_EXITO_VISITA = 'Visita guardada correctamente. La información fue registrada satisfactoriamente';

    private const MENSAJE_EXITO_BORRADOR = 'Borrador guardado correctamente. Puedes continuar diligenciándolo posteriormente';

    private const MENSAJE_ERROR_GUARDADO = 'No fue posible guardar la visita. Revisa los errores indicados e inténtalo nuevamente';

    public function index(Request $request): Response
    {
        $consulta = VisitaExtensionismo::query()->with(['borrador.veredaRelacion', 'productor', 'predio.vereda', 'usuarioResponsable'])
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
        $nombresEnfoques = EnfoquePoblacional::query()->pluck('nombre', 'enfoque_poblacional')->all();
        $historial = VersionAuditoria::query()->with(['cambios', 'usuarioResponsable'])->where('entidad', 'visita_extensionismo')->whereIn('registro', $ids)->latest('numero_version')->get()->groupBy('registro')->map(function ($versiones) use ($nombresEnfoques): array {
            return $versiones->map(function ($version) use ($nombresEnfoques): array {
                $usuario = $version->getRelation('usuarioResponsable');

                return ['id' => (string) $version->numero_version, 'numero' => (int) $version->numero_version, 'fechaHora' => Carbon::parse($version->created_at)->format('d/m/Y H:i'), 'usuario' => $usuario ? $usuario->name : 'Usuario no disponible', 'operacion' => $version->accion, 'cambios' => $version->cambios->map(fn ($cambio) => ['campo' => $cambio->campo, 'etiqueta' => $this->etiquetaCampo($cambio->campo), 'anterior' => $cambio->campo === 'enfoques_poblacionales' ? $this->nombresEnfoques($cambio->valor_anterior, $nombresEnfoques) : ($cambio->valor_anterior ?? 'Sin valor'), 'nuevo' => $cambio->campo === 'enfoques_poblacionales' ? $this->nombresEnfoques($cambio->valor_nuevo, $nombresEnfoques) : ($cambio->valor_nuevo ?? 'Sin valor')])->all()];
            })->all();
        })->all();

        return Inertia::render('visitas-extensionismo/listado', ['visitas' => $paginadas->getCollection()->map(fn (VisitaExtensionismo $v) => $this->resumen($v))->all(), 'paginacion' => ['paginaActual' => $paginadas->currentPage(), 'ultimaPagina' => $paginadas->lastPage(), 'total' => $paginadas->total()], 'historialTrazabilidad' => $historial, 'filtros' => $request->only(['buscar', 'desde', 'hasta']), 'indicadores' => ['total' => VisitaExtensionismo::count(), 'borradores' => VisitaExtensionismo::where('estado', 'borrador')->count(), 'veredas' => VisitaExtensionismo::query()->whereNotNull('visitas_extensionismo.predio')->join('predios', 'predios.predio', '=', 'visitas_extensionismo.predio')->distinct('predios.vereda')->count('predios.vereda')]]);
    }

    public function create(): Response
    {
        return Inertia::render('visitas-extensionismo/crear', $this->catalogos());
    }

    public function edit(VisitaExtensionismo $visita): Response
    {
        $visita->load(['borrador', 'productor.predios.divipola', 'productor.predios.corregimiento', 'productor.predios.vereda', 'predio.divipola', 'predio.corregimiento', 'predio.vereda', 'lineaProductivaPrincipal', 'lineaProductivaSecundaria', 'especieProductiva', 'enfoquesPoblacionales', 'anexos.archivo']);

        return Inertia::render('visitas-extensionismo/crear', [...$this->catalogos(), 'visita' => $this->formulario($visita)]);
    }

    public function fotografia(VisitaExtensionismo $visita, Anexo $anexo): StreamedResponse
    {
        abort_unless($anexo->entidad === 'visita_extensionismo' && (int) $anexo->registro === (int) $visita->getKey() && $anexo->tipo_anexo === 'fotografia', 404);
        $archivo = $anexo->archivo()->firstOrFail();

        return Storage::disk($archivo->disco)->response($archivo->ruta, $archivo->nombre_original, ['Content-Type' => $archivo->tipo_mime]);
    }

    public function eliminarFotografia(VisitaExtensionismo $visita, Anexo $anexo, ServicioAuditoria $auditoria): RedirectResponse
    {
        abort_unless($anexo->entidad === 'visita_extensionismo' && (int) $anexo->registro === (int) $visita->getKey() && $anexo->tipo_anexo === 'fotografia', 404);
        $archivo = $anexo->archivo()->firstOrFail();
        $nombre = $archivo->nombre_original;

        DB::transaction(function () use ($anexo, $archivo, $auditoria, $visita, $nombre): void {
            $anexo->delete();
            if (! $archivo->anexos()->exists()) {
                Storage::disk($archivo->disco)->delete($archivo->ruta);
                $archivo->delete();
            }
            $auditoria->registrar('visita_extensionismo', (int) $visita->getKey(), 'Fotografía eliminada', auth()->id(), [
                'fotografia' => ['anterior' => $nombre, 'nuevo' => null],
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fotografía eliminada correctamente.']);

        return back();
    }

    public function storeBorrador(GuardarBorradorVisitaRequest $request, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        try {
            $visita = $servicio->guardar($request->validated(), (int) $request->user()->id, false);
        } catch (\Throwable $error) {
            return $this->respuestaErrorGuardado($error);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => self::MENSAJE_EXITO_BORRADOR]);

        return to_route('visitas-extensionismo.editar', $visita);
    }

    public function store(GuardarVisitaRequest $request, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        try {
            $servicio->guardar($request->validated(), (int) $request->user()->id, true);
        } catch (\Throwable $error) {
            return $this->respuestaErrorGuardado($error);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => self::MENSAJE_EXITO_VISITA]);

        return to_route('visitas-extensionismo.index');
    }

    public function updateBorrador(GuardarBorradorVisitaRequest $request, VisitaExtensionismo $visita, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        try {
            $servicio->guardar($request->validated(), (int) $request->user()->id, false, $visita);
        } catch (\Throwable $error) {
            return $this->respuestaErrorGuardado($error);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => self::MENSAJE_EXITO_BORRADOR]);

        return to_route('visitas-extensionismo.editar', $visita);
    }

    public function update(GuardarVisitaRequest $request, VisitaExtensionismo $visita, ServicioVisitasExtensionismo $servicio): RedirectResponse
    {
        try {
            $servicio->guardar($request->validated(), (int) $request->user()->id, true, $visita);
        } catch (\Throwable $error) {
            return $this->respuestaErrorGuardado($error);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => self::MENSAJE_EXITO_VISITA]);

        return to_route('visitas-extensionismo.index');
    }

    private function respuestaErrorGuardado(\Throwable $error): RedirectResponse
    {
        if ($error instanceof HttpExceptionInterface && $error->getStatusCode() === 422) {
            throw ValidationException::withMessages([
                'numero_documento' => [$error->getMessage()],
            ]);
        }

        report($error);
        Inertia::flash('toast', ['type' => 'error', 'message' => self::MENSAJE_ERROR_GUARDADO]);

        return back()->withInput();
    }

    public function buscarProductores(Request $request): JsonResponse
    {
        $tipoDocumento = trim((string) $request->input('tipo_documento', ''));
        $documento = trim((string) $request->input('numero_documento', ''));
        $nombres = trim((string) $request->input('nombres', ''));
        $apellidos = trim((string) $request->input('apellidos', ''));
        $consulta = Productor::query()->with([
            'predios.divipola',
            'predios.corregimiento',
            'predios.vereda',
            'predios.visitasExtensionismo.lineaProductivaPrincipal',
            'predios.visitasExtensionismo.especieProductiva',
        ]);

        if ($tipoDocumento !== '') {
            if ($documento === '') {
                return response()->json([]);
            }

            return response()->json($consulta->where('tipo_documento', $tipoDocumento)->where('numero_documento', $documento)->get()->map(fn (Productor $productor): array => $this->datosProductor($productor))->values());
        }

        if (mb_strlen($documento) < 2 && mb_strlen($nombres) < 2 && mb_strlen($apellidos) < 2) {
            return response()->json([]);
        }

        return response()->json($consulta->when($documento !== '' && $nombres === '' && $apellidos === '', fn ($q) => $q->where(fn ($q) => $q->where('numero_documento', 'like', "%{$documento}%")->orWhere('nombres', 'like', "%{$documento}%")->orWhere('apellidos', 'like', "%{$documento}%")))->when($documento !== '' && ($nombres !== '' || $apellidos !== ''), fn ($q) => $q->where('numero_documento', 'like', "%{$documento}%"))->when($nombres !== '', fn ($q) => $q->where('nombres', 'like', "%{$nombres}%"))->when($apellidos !== '', fn ($q) => $q->where('apellidos', 'like', "%{$apellidos}%"))->limit(10)->get()->map(fn (Productor $productor): array => $this->datosProductor($productor))->values());
    }

    /** @return array<string, string> */
    private function resumen(VisitaExtensionismo $v): array
    {
        $productor = $v->getRelation('productor');
        $predio = $v->getRelation('predio');
        $borrador = $v->getRelation('borrador');
        $usuario = $v->getRelation('usuarioResponsable');
        $vereda = $predio instanceof Predio ? $predio->getRelation('vereda') : null;
        $veredaBorrador = $borrador?->getRelation('veredaRelacion');

        return ['entidad' => 'visita_extensionismo', 'etiquetaEntidad' => 'Visita', 'numero' => (string) $v->getKey(), 'productor' => $productor instanceof Productor ? $productor->nombre_completo : trim("{$borrador?->nombres_productor} {$borrador?->apellidos_productor}"), 'extensionista' => $v->nombre_extensionista ?? ($usuario instanceof User ? $usuario->name : 'Sin asignar'), 'fecha' => $v->fecha_visita ? Carbon::parse($v->fecha_visita)->format('d/m/Y') : 'Sin fecha', 'vereda' => $vereda instanceof Vereda ? $vereda->nombre : ($veredaBorrador instanceof Vereda ? $veredaBorrador->nombre : 'Sin registrar'), 'estado' => $v->estado === 'borrador' ? 'Borrador' : 'Registrada', 'estadoReal' => $v->estado];
    }

    /** @return array<string, mixed> */
    private function formulario(VisitaExtensionismo $v): array
    {
        $productor = $this->productorDe($v);
        $predio = $this->predioDe($v);
        $borrador = $v->getRelation('borrador');
        $actividad = $this->actividadFormulario($v);

        return [
            'id' => $v->getKey(),
            'estado' => $v->estado,
            'productor' => $productor ? $this->datosProductor($productor) : null,
            'actividadHistorica' => [
                'principal' => $this->lineaHistorica($v->getRelation('lineaProductivaPrincipal')),
                'secundaria' => $this->lineaHistorica($v->getRelation('lineaProductivaSecundaria')),
            ],
            'campos' => [...$v->only(['fecha_visita', 'numero_animales', 'area_hectareas', 'unidad_area_ingresada', 'tipo_discapacidad', 'victima_conflicto_armado', 'afiliado_sisben', 'puntaje_sisben', 'afiliado_asociacion', 'nombre_asociacion', 'aspecto_visita', 'componente_visita', 'diagnostico', 'actividades_realizadas', 'principales_proveedores', 'principales_compradores', 'fuentes_consulta', 'recomendaciones', 'compromisos', 'nombre_extensionista', 'numero_documento_extensionista', 'disciplina_extensionista', 'titulo_academico_extensionista']), ...$actividad],
            'nombres' => $borrador?->nombres_productor ?? $productor?->nombres,
            'apellidos' => $borrador?->apellidos_productor ?? $productor?->apellidos,
            'tipo_documento' => $borrador?->tipo_documento ?? $productor?->tipo_documento,
            'numero_documento' => $borrador?->numero_documento ?? $productor?->numero_documento,
            'telefono' => $borrador?->telefono_productor ?? $productor?->telefono,
            'sexo' => $borrador?->sexo_productor ?? $productor?->sexo,
            'productor_existente' => $productor?->getKey(),
            'predio_existente' => $predio?->getKey(),
            'nombre_predio' => $borrador?->nombre_predio ?? $predio?->nombre,
            'divipola' => $borrador?->divipola ?? $predio?->divipola,
            'corregimiento' => $borrador?->corregimiento ?? $predio?->corregimiento,
            'vereda' => $borrador?->vereda ?? $predio?->vereda,
            'latitud' => $borrador?->latitud ?? $predio?->latitud,
            'longitud' => $borrador?->longitud ?? $predio?->longitud,
            'enfoques_poblacionales' => $v->enfoquesPoblacionales->pluck('enfoque_poblacional')->all(),
            'fotografias' => $v->anexos->map(fn ($a) => ['id' => $a->getKey(), 'nombre' => $a->archivo()->first()->nombre_original])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function actividadFormulario(VisitaExtensionismo $visita): array
    {
        $principal = $visita->getRelation('lineaProductivaPrincipal');
        $secundaria = $visita->getRelation('lineaProductivaSecundaria');
        $especie = $visita->getRelation('especieProductiva');
        $categoriaPrincipal = $principal ? $this->categoriaLinea($principal->codigo) : null;
        $categoriaSecundaria = $secundaria ? $this->categoriaLinea($secundaria->codigo) : null;
        $semanticaEspecie = $especie ? $this->semanticaEspecie($especie->codigo) : null;

        return [
            'linea_productiva_principal' => $this->idLineaCanonica($categoriaPrincipal),
            'especie_productiva' => $categoriaPrincipal && $categoriaPrincipal !== 'OTRA'
                ? $this->idEspecieCanonica($categoriaPrincipal, $semanticaEspecie)
                : null,
            'linea_productiva_secundaria' => $this->idLineaCanonica($categoriaSecundaria),
            'linea_productiva_principal_otra' => $visita->linea_productiva_principal_otra,
            'especie_productiva_otra' => $visita->especie_productiva_otra,
            'linea_productiva_secundaria_otra' => $visita->linea_productiva_secundaria_otra,
        ];
    }

    /** @return array<string, mixed> */
    private function datosProductor(Productor $productor): array
    {
        return [
            'productor' => $productor->getKey(),
            'nombres' => $productor->nombres,
            'apellidos' => $productor->apellidos,
            'nombre_completo' => $productor->nombre_completo,
            'tipo_documento' => $productor->tipo_documento,
            'numero_documento' => $productor->numero_documento,
            'telefono' => $productor->telefono,
            'fecha_nacimiento' => $productor->fecha_nacimiento?->format('Y-m-d'),
            'sexo' => $productor->sexo,
            'predios' => $productor->predios->map(function (Predio $predio): array {
                $divipola = $predio->relationLoaded('divipola') ? $predio->getRelation('divipola') : null;
                $corregimiento = $predio->relationLoaded('corregimiento') ? $predio->getRelation('corregimiento') : null;
                $vereda = $predio->relationLoaded('vereda') ? $predio->getRelation('vereda') : null;
                $visita = $predio->relationLoaded('visitasExtensionismo')
                    ? $predio->getRelation('visitasExtensionismo')->sortByDesc('visita_extensionismo')->first()
                    : null;
                $actividad = $visita?->lineaProductivaPrincipal?->nombre;
                if ($visita?->especieProductiva?->nombre) {
                    $actividad = trim(($actividad ?? '').' / '.$visita->especieProductiva->nombre, ' /');
                }

                return [
                    'predio' => $predio->getKey(),
                    'nombre' => $predio->nombre,
                    'divipola' => (int) $predio->getRawOriginal('divipola'),
                    'codigo_departamento' => $divipola?->codigo_departamento,
                    'nombre_departamento' => $divipola?->nombre_departamento,
                    'nombre_municipio' => $divipola?->nombre_municipio,
                    'corregimiento' => $predio->getRawOriginal('corregimiento'),
                    'nombre_corregimiento' => $corregimiento?->nombre,
                    'vereda' => $predio->getRawOriginal('vereda'),
                    'nombre_vereda' => $vereda?->nombre,
                    'latitud' => $predio->latitud,
                    'longitud' => $predio->longitud,
                    'hectareas' => $predio->hectareas,
                    'actividad_productiva' => $actividad,
                ];
            })->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function catalogos(): array
    {
        $lineas = LineaProductiva::query()->where('activo', true)->whereIn('codigo', ['AGRICOLA', 'PECUARIO'])->get(['linea_productiva', 'codigo', 'nombre'])->sortBy(fn (LineaProductiva $linea): int => array_search($linea->codigo, ['AGRICOLA', 'PECUARIO'], true))->values();
        $idsLineas = $lineas->pluck('linea_productiva');
        $especies = EspecieProductiva::query()->where('activo', true)->whereIn('linea_productiva', $idsLineas)->get(['especie_productiva', 'linea_productiva', 'codigo', 'nombre', 'grupo']);

        return ['divipolas' => Divipola::query()->orderBy('nombre_municipio')->get(['divipola', 'codigo_departamento', 'nombre_departamento', 'codigo_municipio', 'nombre_municipio']), 'corregimientos' => Corregimiento::query()->orderBy('nombre')->get(['corregimiento', 'divipola', 'nombre']), 'veredas' => Vereda::query()->orderBy('nombre')->get(['vereda', 'corregimiento', 'nombre']), 'lineasProductivas' => $lineas, 'especiesProductivas' => $especies, 'enfoquesPoblacionales' => EnfoquePoblacional::query()->where('activo', true)->orderBy('nombre')->get(['enfoque_poblacional', 'nombre'])];
    }

    /** @return array{id: int, codigo: string, nombre: string}|null */
    private function lineaHistorica(?LineaProductiva $linea): ?array
    {
        if ($linea === null || $linea->codigo !== 'OTRA') {
            return null;
        }

        return [
            'id' => (int) $linea->getKey(),
            'codigo' => $linea->codigo,
            'nombre' => $linea->nombre,
        ];
    }

    private function categoriaLinea(string $codigo): ?string
    {
        if (in_array($codigo, ['AGRICOLA', 'PECUARIO', 'OTRA'], true)) {
            return $codigo;
        }

        if (in_array($codigo, ['ARROZ', 'CACAO', 'CAFE', 'PLATANO_BANANO', 'MAIZ', 'YUCA', 'CANA', 'PALMA_ACEITE', 'PINA', 'FRUTICULTURA', 'CITRICULTURA', 'SORGO'], true)) {
            return 'AGRICOLA';
        }

        return in_array($codigo, ['GANADERIA_BOVINA', 'PRODUCCION_EQUINA', 'PISCICULTURA', 'AVICULTURA', 'PORCICULTURA', 'OVINOCULTURA'], true) ? 'PECUARIO' : null;
    }

    private function semanticaEspecie(string $codigo): string
    {
        return match ($codigo) {
            'BOVINO', 'MI10_BOVINO' => 'BOVINO',
            'EQUINO', 'MI10_EQUINO' => 'EQUINO',
            'AVE', 'MI10_AVICOLA' => 'AVICOLA',
            'PORCINO', 'MI10_PORCINO' => 'PORCINO',
            'OVINO', 'MI10_OVINO' => 'OVINO',
            'MI10_PISCICOLA', 'CACHAMA', 'MOJARRA', 'YAMU', 'BAGRE', 'BOCACHICO' => 'PISCICOLA',
            'MI10_OTRA_AGRICOLA', 'MI10_OTRA_PECUARIO' => 'OTRA',
            default => str_starts_with($codigo, 'MI10_') ? substr($codigo, 5) : $codigo,
        };
    }

    private function idLineaCanonica(?string $categoria): ?int
    {
        return $categoria === null ? null : (int) DB::table('lineas_productivas')->where('codigo', $categoria)->value('linea_productiva');
    }

    private function idEspecieCanonica(string $categoria, ?string $semantica): ?int
    {
        if ($semantica === null || $semantica === '') {
            return null;
        }

        $codigo = $semantica === 'OTRA'
            ? ($categoria === 'AGRICOLA' ? 'MI10_OTRA_AGRICOLA' : 'MI10_OTRA_PECUARIO')
            : 'MI10_'.$semantica;

        $idLinea = $this->idLineaCanonica($categoria);

        return $idLinea === null ? null : (int) DB::table('especies_productivas')->where('codigo', $codigo)->where('linea_productiva', $idLinea)->value('especie_productiva');
    }

    private function etiquetaCampo(string $campo): string
    {
        return ['diagnostico' => 'Diagnóstico', 'recomendaciones' => 'Recomendaciones', 'compromisos' => 'Compromisos', 'actividades_realizadas' => 'Actividades realizadas', 'enfoques_poblacionales' => 'Enfoques poblacionales', 'productor' => 'Productor', 'predio' => 'Predio', 'estado' => 'Estado'][$campo] ?? str_replace('_', ' ', ucfirst($campo));
    }

    /** @param array<int|string, string> $nombresEnfoques */
    private function nombresEnfoques(?string $valor, array $nombresEnfoques): string
    {
        if ($valor === null || trim($valor) === '') {
            return 'Sin valor';
        }

        $decodificado = json_decode($valor, true);
        $identificadores = is_array($decodificado)
            ? $decodificado
            : (preg_split('/\s*,\s*/', trim($valor)) ?: []);

        return collect($identificadores)
            ->map(function (mixed $identificador) use ($nombresEnfoques): string {
                $id = is_scalar($identificador) ? trim((string) $identificador) : '';

                return $id !== '' && ctype_digit($id)
                    ? ($nombresEnfoques[(int) $id] ?? 'Enfoque no disponible')
                    : 'Enfoque no disponible';
            })
            ->implode(', ');
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
