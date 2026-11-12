<?php

namespace App\Servicios;

use App\Models\Archivo;
use App\Models\EnfoquePoblacional;
use App\Models\Predio;
use App\Models\Productor;
use App\Models\VisitaExtensionismo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ServicioVisitasExtensionismo
{
    public function __construct(private ServicioAuditoria $auditoria) {}

    /** @param array<string,mixed> $datos */
    public function guardar(array $datos, int $usuario, bool $definitivo, ?VisitaExtensionismo $visita = null): VisitaExtensionismo
    {
        $rutasNuevas = [];
        try {
            return DB::transaction(function () use ($datos, $usuario, $definitivo, $visita, &$rutasNuevas): VisitaExtensionismo {
                $esNueva = $visita === null;
                $visita ??= new VisitaExtensionismo;
                $antes = $visita->getAttributes();
                $productor = $definitivo ? $this->resolverProductor($datos, $usuario) : null;
                $predio = $definitivo ? $this->resolverPredio($datos, $productor) : null;
                $visita->fill(Arr::except($datos, ['fotografias', 'enfoques_poblacionales', 'productor', 'predio']));
                $visita->fill($this->camposBorrador($datos));
                $visita->productor = $productor?->getKey();
                $visita->predio = $predio?->getKey();
                $visita->setAttribute('usuario', $usuario);
                $estabaRegistrada = $visita->estado === 'registrado';
                $visita->estado = $definitivo ? 'registrado' : 'borrador';
                if ($definitivo && ($esNueva || ! $estabaRegistrada)) {
                    $visita->fecha_registro = now();
                } elseif (! $definitivo && $esNueva) {
                    $visita->fecha_registro = null;
                }
                $visita->save();
                $enfoquesAntes = $visita->enfoquesPoblacionales()->pluck('enfoques_poblacionales.enfoque_poblacional')->sort()->values()->all();
                $enfoques = EnfoquePoblacional::query()->whereIn('enfoque_poblacional', $datos['enfoques_poblacionales'] ?? [])->pluck('enfoque_poblacional')->sort()->values()->all();
                $visita->enfoquesPoblacionales()->sync($enfoques);
                $this->guardarFotografias($visita, $datos['fotografias'] ?? [], $rutasNuevas);
                $cambios = [];
                foreach ($visita->getChanges() as $campo => $nuevo) {
                    if (! in_array($campo, ['fecha_creacion', 'fecha_actualizacion'], true)) {
                        $cambios[$campo] = ['anterior' => $antes[$campo] ?? null, 'nuevo' => $nuevo];
                    }
                }
                if ($enfoquesAntes !== $enfoques) {
                    $cambios['enfoques_poblacionales'] = ['anterior' => $enfoquesAntes, 'nuevo' => $enfoques];
                }
                $this->auditoria->registrar('visita_extensionismo', (int) $visita->getKey(), $esNueva ? ($definitivo ? 'Creación' : 'Borrador creado') : ($definitivo ? 'Actualización' : 'Borrador actualizado'), $usuario, $cambios);

                return $visita;
            });
        } catch (\Throwable $error) {
            foreach ($rutasNuevas as $ruta) {
                Storage::disk('local')->delete($ruta);
            }
            throw $error;
        }
    }

    /** @param array<string,mixed> $datos */
    private function resolverProductor(array $datos, int $usuario): Productor
    {
        if (! empty($datos['productor_existente'])) {
            $productor = Productor::query()->where('productor', $datos['productor_existente'])->firstOrFail();
            if ($productor->tipo_documento !== $datos['tipo_documento'] || $productor->numero_documento !== $datos['numero_documento']) {
                abort(422, 'El productor seleccionado no coincide con el documento ingresado.');
            }

            return $productor;
        }
        $atributos = Arr::only($datos, ['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'telefono', 'fecha_nacimiento', 'sexo']);
        $productor = Productor::query()->where('tipo_documento', $datos['tipo_documento'])->where('numero_documento', $datos['numero_documento'])->first();
        if ($productor === null) {
            $productor = Productor::query()->create($atributos);
            $this->auditoria->registrar('productor', (int) $productor->getKey(), 'Creación', $usuario, collect($atributos)->map(fn ($valor) => ['anterior' => null, 'nuevo' => $valor])->all());
        }

        return $productor;
    }

    /** @param array<string,mixed> $datos */
    private function resolverPredio(array $datos, Productor $productor): Predio
    {
        if (! empty($datos['predio_existente'])) {
            return Predio::query()->where('productor', $productor->getKey())->where('predio', $datos['predio_existente'])->firstOrFail();
        }

        return Predio::query()->create(['productor' => $productor->getKey(), 'nombre' => $datos['nombre_predio'], 'divipola' => $datos['divipola'], 'corregimiento' => $datos['corregimiento'] ?? null, 'vereda' => $datos['vereda'] ?? null, 'latitud' => $datos['latitud'] ?? null, 'longitud' => $datos['longitud'] ?? null]);
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function camposBorrador(array $datos): array
    {
        return ['nombres_productor_borrador' => $datos['nombres'] ?? null, 'apellidos_productor_borrador' => $datos['apellidos'] ?? null, 'tipo_documento_borrador' => $datos['tipo_documento'] ?? null, 'numero_documento_borrador' => $datos['numero_documento'] ?? null, 'telefono_productor_borrador' => $datos['telefono'] ?? null, 'sexo_productor_borrador' => $datos['sexo'] ?? null, 'nombre_predio_borrador' => $datos['nombre_predio'] ?? null, 'divipola_borrador' => $datos['divipola'] ?? null, 'corregimiento_borrador' => $datos['corregimiento'] ?? null, 'vereda_borrador' => $datos['vereda'] ?? null, 'latitud_borrador' => $datos['latitud'] ?? null, 'longitud_borrador' => $datos['longitud'] ?? null];
    }

    /**
     * @param  array<int, UploadedFile>  $fotografias
     * @param  array<int, string>  $rutasNuevas
     */
    private function guardarFotografias(VisitaExtensionismo $visita, array $fotografias, array &$rutasNuevas): void
    {
        foreach ($fotografias as $fotografia) {
            $ruta = $fotografia->store('visitas-extensionismo/'.$visita->getKey(), 'local');
            if ($ruta === false) {
                throw new \RuntimeException('No fue posible almacenar la fotografía.');
            }
            $rutasNuevas[] = $ruta;
            try {
                $archivo = Archivo::query()->create(['nombre_original' => $fotografia->getClientOriginalName(), 'nombre_almacenado' => basename($ruta), 'ruta' => $ruta, 'disco' => 'local', 'tipo_mime' => $fotografia->getMimeType() ?? 'application/octet-stream', 'tamano' => $fotografia->getSize()]);
                $visita->anexos()->create(['entidad' => 'visita_extensionismo', 'tipo_anexo' => 'fotografia', 'archivo' => $archivo->getKey()]);
            } catch (\Throwable $error) {
                Storage::disk('local')->delete($ruta);
                throw $error;
            }
        }
    }
}
