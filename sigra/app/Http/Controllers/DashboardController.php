<?php

namespace App\Http\Controllers;

use App\Models\EnfoquePoblacional;
use App\Models\Predio;
use App\Models\Productor;
use App\Models\Vereda;
use App\Models\VersionAuditoria;
use App\Models\VisitaExtensionismo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $visitas = VisitaExtensionismo::query()
            ->with(['borrador.veredaRelacion', 'productor', 'predio.vereda', 'usuarioResponsable'])
            ->latest('visita_extensionismo')
            ->get();
        $ids = $visitas->pluck('visita_extensionismo');
        $historial = $this->historialDe(
            'visita_extensionismo',
            $ids,
            EnfoquePoblacional::query()->pluck('nombre', 'enfoque_poblacional')->all(),
        );

        return Inertia::render('dashboard', [
            'registros' => $visitas->map(function (VisitaExtensionismo $visita): array {
                $productor = $visita->getRelation('productor');
                $predio = $visita->getRelation('predio');
                $vereda = $predio instanceof Predio ? $predio->getRelation('vereda') : null;
                $borrador = $visita->getRelation('borrador');
                $veredaBorrador = $borrador?->getRelation('veredaRelacion');
                $extensionista = $visita->getRelation('usuarioResponsable');

                return [
                    'entidad' => 'visita_extensionismo',
                    'etiquetaEntidad' => 'Visita',
                    'numero' => (string) $visita->getKey(),
                    'productor' => $productor instanceof Productor ? $productor->nombre_completo : 'Sin productor',
                    'predio' => $predio instanceof Predio ? $predio->nombre : 'Sin predio',
                    'extensionista' => $visita->nombre_extensionista ?? $extensionista?->name ?? 'Sin asignar',
                    'vereda' => $vereda instanceof Vereda ? $vereda->nombre : ($veredaBorrador instanceof Vereda ? $veredaBorrador->nombre : 'Sin registrar'),
                    'estado' => $visita->estado === 'registrado' ? 'Registrada' : 'Borrador',
                    'estadoReal' => $visita->estado,
                    'fecha' => $visita->fecha_visita ? Carbon::parse($visita->fecha_visita)->format('d/m/Y') : 'Sin fecha',
                    'fechaParaFiltro' => $visita->fecha_visita?->format('Y-m-d') ?? '',
                    'tipoVisita' => 'MI10-F58',
                ];
            })->all(),
            'indicadores' => [
                'visitasExtensionismo' => $visitas->count(),
                'productoresRegistrados' => $visitas->pluck('productor')->filter()->unique()->count(),
            ],
            'historialTrazabilidad' => $historial,
        ]);
    }

    /** @param Collection<int, mixed> $ids */
    /** @param array<int|string, string> $nombresEnfoques */
    private function historialDe(string $entidad, Collection $ids, array $nombresEnfoques): array
    {
        return VersionAuditoria::query()
            ->with(['cambios', 'usuarioResponsable'])
            ->where('entidad', $entidad)
            ->whereIn('registro', $ids)
            ->latest('numero_version')
            ->get()
            ->groupBy('registro')
            ->map(fn ($versiones) => $versiones->map(function ($version) use ($nombresEnfoques): array {
                $usuario = $version->getRelation('usuarioResponsable');

                return [
                    'id' => (string) $version->numero_version,
                    'numero' => (int) $version->numero_version,
                    'fechaHora' => Carbon::parse($version->created_at)->format('d/m/Y H:i'),
                    'usuario' => $usuario?->name ?? 'Usuario no disponible',
                    'operacion' => $version->accion,
                    'cambios' => $version->cambios->map(fn ($cambio) => [
                        'campo' => $cambio->campo,
                        'etiqueta' => $this->etiquetaCampo($cambio->campo),
                        'anterior' => $cambio->campo === 'enfoques_poblacionales' ? $this->nombresEnfoques($cambio->valor_anterior, $nombresEnfoques) : ($cambio->valor_anterior ?? 'Sin valor'),
                        'nuevo' => $cambio->campo === 'enfoques_poblacionales' ? $this->nombresEnfoques($cambio->valor_nuevo, $nombresEnfoques) : ($cambio->valor_nuevo ?? 'Sin valor'),
                    ])->all(),
                ];
            })->all())->all();
    }

    private function etiquetaCampo(string $campo): string
    {
        return [
            'diagnostico' => 'Diagnóstico',
            'recomendaciones' => 'Recomendaciones',
            'compromisos' => 'Compromisos',
            'actividades_realizadas' => 'Actividades realizadas',
            'enfoques_poblacionales' => 'Enfoques poblacionales',
            'productor' => 'Productor',
            'predio' => 'Predio',
            'estado' => 'Estado',
        ][$campo] ?? str_replace('_', ' ', ucfirst($campo));
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
}
