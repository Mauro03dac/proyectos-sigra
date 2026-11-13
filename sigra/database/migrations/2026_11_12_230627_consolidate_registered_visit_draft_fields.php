<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('visitas_extensionismo')
            ->where('estado', 'registrado')
            ->whereNotNull('productor')
            ->whereNotNull('predio')
            ->orderBy('visita_extensionismo')
            ->chunkById(200, function (Collection $visitas): void {
                $productores = DB::table('productores')
                    ->whereIn('productor', $visitas->pluck('productor')->unique())
                    ->get()
                    ->keyBy('productor');
                $predios = DB::table('predios')
                    ->whereIn('predio', $visitas->pluck('predio')->unique())
                    ->get()
                    ->keyBy('predio');

                foreach ($visitas as $visita) {
                    $productor = $productores->get($visita->productor);
                    $predio = $predios->get($visita->predio);

                    if ($productor === null || $predio === null || (int) $predio->productor !== (int) $visita->productor) {
                        continue;
                    }

                    $actualizaciones = [
                        ...$this->redundantes($visita, $productor, $this->producerFields()),
                        ...$this->redundantes($visita, $predio, $this->propertyFields()),
                    ];

                    if ($actualizaciones !== []) {
                        DB::table('visitas_extensionismo')
                            ->where('visita_extensionismo', $visita->visita_extensionismo)
                            ->update($actualizaciones);
                    }
                }
            }, 'visita_extensionismo');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Los valores eliminados eran copias exactas de los registros definitivos.
    }

    /**
     * @param  array<string, string>  $fields
     * @return array<string, null>
     */
    private function redundantes(object $visita, object $definitivo, array $fields): array
    {
        $redundantes = [];

        foreach ($fields as $temporal => $campoDefinitivo) {
            if ($visita->{$temporal} !== null && $this->equivalentes($visita->{$temporal}, $definitivo->{$campoDefinitivo}, $temporal)) {
                $redundantes[$temporal] = null;
            }
        }

        return $redundantes;
    }

    /** @return array<string, string> */
    private function producerFields(): array
    {
        return [
            'nombres_productor_borrador' => 'nombres',
            'apellidos_productor_borrador' => 'apellidos',
            'tipo_documento_borrador' => 'tipo_documento',
            'numero_documento_borrador' => 'numero_documento',
            'telefono_productor_borrador' => 'telefono',
            'sexo_productor_borrador' => 'sexo',
        ];
    }

    /** @return array<string, string> */
    private function propertyFields(): array
    {
        return [
            'nombre_predio_borrador' => 'nombre',
            'divipola_borrador' => 'divipola',
            'corregimiento_borrador' => 'corregimiento',
            'vereda_borrador' => 'vereda',
            'latitud_borrador' => 'latitud',
            'longitud_borrador' => 'longitud',
        ];
    }

    private function equivalentes(mixed $temporal, mixed $definitivo, string $campoTemporal): bool
    {
        if ($temporal === null || $definitivo === null) {
            return $temporal === $definitivo;
        }

        if (in_array($campoTemporal, ['divipola_borrador', 'corregimiento_borrador', 'vereda_borrador', 'latitud_borrador', 'longitud_borrador'], true)) {
            return is_numeric($temporal)
                && is_numeric($definitivo)
                && abs((float) $temporal - (float) $definitivo) < 0.0000001;
        }

        return (string) $temporal === (string) $definitivo;
    }
};
