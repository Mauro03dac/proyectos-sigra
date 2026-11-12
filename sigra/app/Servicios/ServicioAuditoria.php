<?php

namespace App\Servicios;

use App\Models\CambioAuditoria;
use App\Models\VersionAuditoria;

class ServicioAuditoria
{
    /** @param array<string, array{anterior: mixed, nuevo: mixed}> $cambios */
    public function registrar(string $entidad, int $registro, string $accion, ?int $usuario, array $cambios): void
    {
        if ($cambios === []) {
            return;
        }

        $numero = (int) VersionAuditoria::query()->where('entidad', $entidad)->where('registro', $registro)->max('numero_version') + 1;
        $version = VersionAuditoria::query()->create(['entidad' => $entidad, 'registro' => $registro, 'numero_version' => $numero, 'accion' => $accion, 'usuario' => $usuario]);

        foreach ($cambios as $campo => $valores) {
            CambioAuditoria::query()->create(['version_auditoria' => $version->getKey(), 'campo' => $campo, 'valor_anterior' => $this->texto($valores['anterior']), 'valor_nuevo' => $this->texto($valores['nuevo'])]);
        }
    }

    private function texto(mixed $valor): ?string
    {
        if ($valor === null) {
            return null;
        }
        if (is_bool($valor)) {
            return $valor ? 'Sí' : 'No';
        }
        if (is_array($valor)) {
            return implode(', ', array_map('strval', $valor));
        }

        return (string) $valor;
    }
}
