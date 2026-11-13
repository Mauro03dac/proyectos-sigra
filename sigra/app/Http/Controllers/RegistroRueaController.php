<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuardarBorradorRueaRequest;
use App\Http\Requests\GuardarRueaRequest;
use App\Models\Corregimiento;
use App\Models\Divipola;
use App\Models\Predio;
use App\Models\Productor;
use App\Models\RegistroRuea;
use App\Models\Vereda;
use App\Models\VersionAuditoria;
use App\Models\VisitaExtensionismo;
use App\Servicios\ServicioRuea;
use App\Support\Ruea\PreguntasRuea;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class RegistroRueaController extends Controller
{
    private const MENSAJE_EXITO_REGISTRO = 'RUEA guardado correctamente. La información fue registrada satisfactoriamente';

    private const MENSAJE_EXITO_BORRADOR = 'Borrador RUEA guardado correctamente. Puedes continuar diligenciándolo posteriormente';

    private const MENSAJE_ERROR_GUARDADO = 'No fue posible guardar el RUEA. Revisa los errores indicados e inténtalo nuevamente';

    public function index(): Response
    {
        $registros = RegistroRuea::query()
            ->with(['productorRelacionado', 'predioRelacionado.vereda', 'usuarioResponsable'])
            ->orderByDesc('registro_ruea')
            ->get();
        $ids = $registros->pluck('registro_ruea');

        return Inertia::render('registro-ruea/listado', [
            'registros' => $registros->map(fn (RegistroRuea $registro): array => $this->resumen($registro))->all(),
            'historialTrazabilidad' => $this->historialDe($ids),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('registro-ruea/crear', $this->catalogos());
    }

    public function edit(RegistroRuea $registro): Response
    {
        $registro->load([
            'productorRelacionado.predios.divipola', 'productorRelacionado.predios.corregimiento', 'productorRelacionado.predios.vereda',
            'predioRelacionado.divipola', 'predioRelacionado.corregimiento', 'predioRelacionado.vereda', 'respuestas',
        ]);

        return Inertia::render('registro-ruea/crear', [
            ...$this->catalogos(),
            'registro' => $this->formulario($registro),
        ]);
    }

    public function storeBorrador(GuardarBorradorRueaRequest $request, ServicioRuea $servicio): RedirectResponse
    {
        return $this->guardar($request->validated(), $request, $servicio, false);
    }

    public function store(GuardarRueaRequest $request, ServicioRuea $servicio): RedirectResponse
    {
        return $this->guardar($request->validated(), $request, $servicio, true);
    }

    public function updateBorrador(GuardarBorradorRueaRequest $request, RegistroRuea $registro, ServicioRuea $servicio): RedirectResponse
    {
        return $this->guardar($request->validated(), $request, $servicio, false, $registro);
    }

    public function update(GuardarRueaRequest $request, RegistroRuea $registro, ServicioRuea $servicio): RedirectResponse
    {
        return $this->guardar($request->validated(), $request, $servicio, true, $registro);
    }

    /** @param array<string, mixed> $datos */
    private function guardar(array $datos, Request $request, ServicioRuea $servicio, bool $definitivo, ?RegistroRuea $registro = null): RedirectResponse
    {
        try {
            $registro = $servicio->guardar($datos, (int) $request->user()->id, $definitivo, $registro);
        } catch (HttpExceptionInterface $error) {
            if ($error->getStatusCode() === 422) {
                $campo = str_contains(mb_strtolower($error->getMessage()), 'predio') ? 'predio' : 'productor';

                throw ValidationException::withMessages([$campo => [$error->getMessage()]]);
            }

            report($error);
            Inertia::flash('toast', ['type' => 'error', 'message' => self::MENSAJE_ERROR_GUARDADO]);

            return back()->withInput();
        } catch (\Throwable $error) {
            report($error);

            Inertia::flash('toast', ['type' => 'error', 'message' => self::MENSAJE_ERROR_GUARDADO]);

            return back()->withInput();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $definitivo ? self::MENSAJE_EXITO_REGISTRO : self::MENSAJE_EXITO_BORRADOR,
        ]);

        return $definitivo
            ? to_route('registro-ruea.index')
            : to_route('registro-ruea.editar', $registro);
    }

    /** @return array<string, mixed> */
    private function catalogos(): array
    {
        return [
            'divipolas' => Divipola::query()->orderBy('nombre_municipio')->get(['divipola', 'codigo_departamento', 'nombre_departamento', 'codigo_municipio', 'nombre_municipio']),
            'corregimientos' => Corregimiento::query()->orderBy('nombre')->get(['corregimiento', 'divipola', 'nombre']),
            'veredas' => Vereda::query()->orderBy('nombre')->get(['vereda', 'corregimiento', 'nombre']),
        ];
    }

    /** @return array<string, mixed> */
    private function formulario(RegistroRuea $registro): array
    {
        return [
            'id' => (int) $registro->getKey(),
            'estado' => $registro->estado,
            'productor' => $registro->productorRelacionado ? $this->datosProductor($registro->productorRelacionado) : null,
            'predio' => $registro->predioRelacionado ? $this->datosPredio($registro->predioRelacionado) : null,
            'observaciones' => $registro->observaciones ?? '',
            'nombre_extensionista' => $registro->nombre_extensionista ?? '',
            'numero_documento_extensionista' => $registro->numero_documento_extensionista ?? '',
            'perfil_extensionista' => $registro->perfil_extensionista ?? '',
            'respuestas' => $registro->respuestas->pluck('valor', 'campo')->map(fn (mixed $valor): string => (string) $valor)->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function datosProductor(Productor $productor): array
    {
        return [
            'productor' => (int) $productor->getKey(),
            'nombres' => $productor->nombres,
            'apellidos' => $productor->apellidos,
            'nombre_completo' => $productor->nombre_completo,
            'tipo_documento' => $productor->tipo_documento,
            'numero_documento' => $productor->numero_documento,
            'telefono' => $productor->telefono,
            'fecha_nacimiento' => $productor->fecha_nacimiento?->format('Y-m-d'),
            'sexo' => $productor->sexo,
            'predios' => $productor->predios->map(fn (Predio $predio): array => $this->datosPredio($predio))->values()->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function datosPredio(Predio $predio): array
    {
        $divipola = $predio->relationLoaded('divipola') ? $predio->getRelation('divipola') : null;
        $corregimiento = $predio->relationLoaded('corregimiento') ? $predio->getRelation('corregimiento') : null;
        $vereda = $predio->relationLoaded('vereda') ? $predio->getRelation('vereda') : null;
        $visita = VisitaExtensionismo::query()
            ->with(['lineaProductivaPrincipal', 'especieProductiva'])
            ->where('predio', $predio->getKey())
            ->latest('visita_extensionismo')
            ->first();
        $actividad = $visita?->lineaProductivaPrincipal?->nombre;
        if ($visita?->especieProductiva?->nombre) {
            $actividad = trim(($actividad ?? '').' / '.$visita->especieProductiva->nombre, ' /');
        }
        $hectareas = $predio->hectareas ?? $visita?->area_hectareas;

        return [
            'predio' => (int) $predio->getKey(),
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
            'hectareas' => $hectareas,
            'actividad_productiva' => $actividad,
        ];
    }

    /** @return array<string, string> */
    private function resumen(RegistroRuea $registro): array
    {
        $predio = $registro->predioRelacionado;

        return [
            'entidad' => 'registro_ruea',
            'etiquetaEntidad' => 'RUEA',
            'numero' => (string) $registro->getKey(),
            'productor' => $registro->productorRelacionado?->nombre_completo ?? 'Sin productor',
            'extensionista' => $registro->nombre_extensionista ?: ($registro->usuarioResponsable?->name ?? 'Sin asignar'),
            'predio' => $predio?->nombre ?? 'Sin predio',
            'vereda' => $predio?->vereda?->nombre ?? 'Sin registrar',
            'fecha' => $registro->fecha_registro?->format('d/m/Y') ?? Carbon::parse($registro->created_at)->format('d/m/Y'),
            'fechaISO' => $registro->fecha_registro?->format('Y-m-d') ?? Carbon::parse($registro->created_at)->format('Y-m-d'),
            'estado' => $registro->estado === 'registrado' ? 'Registrado' : 'Borrador',
            'estadoReal' => $registro->estado,
        ];
    }

    /** @param Collection<int, mixed> $ids */
    private function historialDe(Collection $ids): array
    {
        return VersionAuditoria::query()
            ->with(['cambios', 'usuarioResponsable'])
            ->where('entidad', 'registro_ruea')
            ->whereIn('registro', $ids)
            ->latest('numero_version')
            ->get()
            ->groupBy('registro')
            ->map(fn ($versiones) => $versiones->map(function ($version): array {
                $usuario = $version->getRelation('usuarioResponsable');

                return [
                    'id' => (string) $version->numero_version,
                    'numero' => (int) $version->numero_version,
                    'fechaHora' => Carbon::parse($version->created_at)->format('d/m/Y H:i'),
                    'usuario' => $usuario?->name ?? 'Usuario no disponible',
                    'operacion' => $version->accion,
                    'cambios' => $version->cambios->map(function ($cambio): array {
                        $campo = (string) $cambio->campo;
                        $codigo = str_starts_with($campo, 'respuesta.') ? substr($campo, 10) : null;

                        return [
                            'campo' => $campo,
                            'etiqueta' => $codigo !== null ? 'Pregunta: '.(PreguntasRuea::ETIQUETAS[$codigo] ?? $codigo) : str_replace('_', ' ', ucfirst($campo)),
                            'anterior' => $cambio->valor_anterior ?? 'Sin valor',
                            'nuevo' => $cambio->valor_nuevo ?? 'Sin valor',
                        ];
                    })->all(),
                ];
            })->all())
            ->all();
    }
}
