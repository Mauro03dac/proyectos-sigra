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
        DB::transaction(function (): void {
            DB::table('visitas_extensionismo')
                ->where(function ($query): void {
                    foreach ($this->campos() as $origen => $destino) {
                        $query->orWhereNotNull($origen);
                    }
                })
                ->orderBy('visita_extensionismo')
                ->chunkById(200, function (Collection $visitas): void {
                    foreach ($visitas as $visita) {
                        $datos = [
                            'visita_extensionismo' => $visita->visita_extensionismo,
                            'created_at' => $visita->created_at,
                            'updated_at' => $visita->updated_at,
                        ];

                        foreach ($this->campos() as $origen => $destino) {
                            $datos[$destino] = $visita->{$origen};
                        }

                        DB::table('visitas_borradores')->upsert(
                            [$datos],
                            ['visita_extensionismo'],
                            array_values($this->campos()),
                        );

                        $trasladado = DB::table('visitas_borradores')
                            ->where('visita_extensionismo', $visita->visita_extensionismo)
                            ->firstOrFail();

                        foreach ($this->campos() as $origen => $destino) {
                            if (! $this->equivalentes($visita->{$origen}, $trasladado->{$destino})) {
                                throw new RuntimeException("No fue posible trasladar el campo {$origen} de la visita {$visita->visita_extensionismo}.");
                            }
                        }
                    }
                }, 'visita_extensionismo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Los datos permanecen en la tabla temporal para no eliminar información al revertir.
    }

    /** @return array<string, string> */
    private function campos(): array
    {
        return [
            'nombres_productor_borrador' => 'nombres_productor',
            'apellidos_productor_borrador' => 'apellidos_productor',
            'tipo_documento_borrador' => 'tipo_documento',
            'numero_documento_borrador' => 'numero_documento',
            'telefono_productor_borrador' => 'telefono_productor',
            'sexo_productor_borrador' => 'sexo_productor',
            'nombre_predio_borrador' => 'nombre_predio',
            'divipola_borrador' => 'divipola',
            'corregimiento_borrador' => 'corregimiento',
            'vereda_borrador' => 'vereda',
            'latitud_borrador' => 'latitud',
            'longitud_borrador' => 'longitud',
        ];
    }

    private function equivalentes(mixed $origen, mixed $destino): bool
    {
        if ($origen === null || $destino === null) {
            return $origen === $destino;
        }

        if (is_numeric($origen) && is_numeric($destino)) {
            return abs((float) $origen - (float) $destino) < 0.0000001;
        }

        return (string) $origen === (string) $destino;
    }
};
