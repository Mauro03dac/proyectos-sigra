<?php

namespace App\Servicios;

use App\Models\Predio;
use App\Models\Productor;
use App\Models\RegistroRuea;
use App\Support\Ruea\PreguntasRuea;
use Illuminate\Support\Facades\DB;

class ServicioRuea
{
    /** @var list<string> */
    private const CAMPOS_AUDITABLES = [
        'productor', 'predio', 'fecha_registro', 'estado', 'observaciones',
        'nombre_extensionista', 'numero_documento_extensionista', 'perfil_extensionista',
        'fecha_finalizacion',
    ];

    public function __construct(private ServicioAuditoria $auditoria) {}

    /** @param array<string, mixed> $datos */
    public function guardar(array $datos, int $usuario, bool $definitivo, ?RegistroRuea $registro = null): RegistroRuea
    {
        return DB::transaction(function () use ($datos, $usuario, $definitivo, $registro): RegistroRuea {
            $esNuevo = $registro === null;
            $registro ??= new RegistroRuea;
            $antes = $registro->getAttributes();
            $respuestasAntes = $registro->exists
                ? $registro->respuestas()->pluck('valor', 'campo')->map(fn (mixed $valor): int => (int) $valor)->all()
                : [];

            $productor = $this->resolverProductor($datos, $registro, $definitivo);
            $predio = $this->resolverPredio($datos, $registro, $productor, $definitivo);

            $registro->fill([
                'productor' => $productor?->getKey(),
                'predio' => $predio?->getKey(),
                'usuario' => $usuario,
                'fecha_registro' => $definitivo ? ($registro->fecha_registro ?? today()) : null,
                'estado' => $definitivo ? 'registrado' : 'borrador',
                'observaciones' => $datos['observaciones'] ?? null,
                'nombre_extensionista' => $datos['nombre_extensionista'] ?? null,
                'numero_documento_extensionista' => $datos['numero_documento_extensionista'] ?? null,
                'perfil_extensionista' => $datos['perfil_extensionista'] ?? null,
                'fecha_finalizacion' => $definitivo ? now() : null,
            ]);
            $registro->save();

            $respuestasNuevas = [];
            foreach (($datos['respuestas'] ?? []) as $campo => $valor) {
                if (! array_key_exists($campo, PreguntasRuea::ETIQUETAS)) {
                    continue;
                }

                $respuesta = $registro->respuestas()->firstOrNew(['campo' => $campo]);
                $respuesta->valor = (int) $valor;
                $respuesta->save();
                $respuestasNuevas[$campo] = (int) $valor;
            }

            $cambios = $this->cambiosRegistro($antes, $registro->getAttributes());
            foreach ($respuestasNuevas as $campo => $valor) {
                $anterior = $respuestasAntes[$campo] ?? null;
                if ($anterior !== $valor) {
                    $cambios["respuesta.{$campo}"] = ['anterior' => $anterior, 'nuevo' => $valor];
                }
            }

            $accion = $esNuevo
                ? ($definitivo ? 'Registro RUEA creado' : 'Borrador RUEA creado')
                : ($definitivo ? 'Registro RUEA actualizado' : 'Borrador RUEA actualizado');
            $this->auditoria->registrar('registro_ruea', (int) $registro->getKey(), $accion, $usuario, $cambios);

            return $registro->fresh(['productorRelacionado.predios', 'predioRelacionado', 'respuestas']);
        });
    }

    /** @param array<string, mixed> $datos */
    private function resolverProductor(array $datos, RegistroRuea $registro, bool $definitivo): ?Productor
    {
        $id = array_key_exists('productor', $datos) ? $datos['productor'] : $registro->getRawOriginal('productor');
        if ($id === null || $id === '') {
            abort_if($definitivo, 422, 'Selecciona un productor registrado antes de confirmar el RUEA.');

            return null;
        }

        return Productor::query()->whereKey($id)->firstOrFail();
    }

    /** @param array<string, mixed> $datos */
    private function resolverPredio(array $datos, RegistroRuea $registro, ?Productor $productor, bool $definitivo): ?Predio
    {
        $id = array_key_exists('predio', $datos) ? $datos['predio'] : $registro->getRawOriginal('predio');
        if ($id === null || $id === '') {
            abort_if($definitivo, 422, 'Selecciona un predio del productor antes de confirmar el RUEA.');

            return null;
        }

        abort_if($productor === null, 422, 'Selecciona el productor antes de seleccionar un predio.');

        return Predio::query()
            ->whereKey($id)
            ->where('productor', $productor->getKey())
            ->firstOrFail();
    }

    /** @param array<string, mixed> $antes @param array<string, mixed> $despues */
    private function cambiosRegistro(array $antes, array $despues): array
    {
        $cambios = [];

        foreach (self::CAMPOS_AUDITABLES as $campo) {
            $anterior = $antes[$campo] ?? null;
            $nuevo = $despues[$campo] ?? null;
            if ((string) $anterior !== (string) $nuevo) {
                $cambios[$campo] = ['anterior' => $anterior, 'nuevo' => $nuevo];
            }
        }

        return $cambios;
    }
}
