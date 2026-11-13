<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** SQLite requires foreign-key pragmas to be changed outside a transaction during table rebuilds. */
    public $withinTransaction = false;

    /** @var array<int, string> */
    private const CAMPOS = [
        'victima_conflicto_armado',
        'afiliado_sisben',
        'afiliado_asociacion',
    ];

    public function up(): void
    {
        foreach (self::CAMPOS as $campo) {
            if (DB::getDriverName() === 'pgsql') {
                $this->cambiarTipoEnPostgres($campo, 'varchar(1)', "CASE WHEN \"{$campo}\" IS TRUE THEN 'S' WHEN \"{$campo}\" IS FALSE THEN 'N' ELSE NULL END");
            } else {
                $this->normalizarValores($campo);

                Schema::table('visitas_extensionismo', function (Blueprint $table) use ($campo): void {
                    $table->string($campo, 1)->nullable()->change();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::CAMPOS as $campo) {
            if (DB::getDriverName() === 'pgsql') {
                $this->cambiarTipoEnPostgres($campo, 'boolean', "CASE WHEN \"{$campo}\" = 'S' THEN TRUE WHEN \"{$campo}\" = 'N' THEN FALSE ELSE NULL END");
            } else {
                $this->restaurarValores($campo);

                Schema::table('visitas_extensionismo', function (Blueprint $table) use ($campo): void {
                    $table->boolean($campo)->nullable()->change();
                });
            }
        }
    }

    private function normalizarValores(string $campo): void
    {
        DB::table('visitas_extensionismo')
            ->whereNotNull($campo)
            ->orderBy('visita_extensionismo')
            ->chunkById(200, function ($visitas) use ($campo): void {
                foreach ($visitas as $visita) {
                    DB::table('visitas_extensionismo')
                        ->where('visita_extensionismo', $visita->visita_extensionismo)
                        ->update([$campo => $this->aSiNo($visita->{$campo})]);
                }
            }, 'visita_extensionismo');
    }

    private function restaurarValores(string $campo): void
    {
        $valorVerdadero = DB::getDriverName() === 'pgsql' ? 'true' : 1;
        $valorFalso = DB::getDriverName() === 'pgsql' ? 'false' : 0;

        DB::table('visitas_extensionismo')->where($campo, 'S')->update([$campo => $valorVerdadero]);
        DB::table('visitas_extensionismo')->where($campo, 'N')->update([$campo => $valorFalso]);
    }

    private function aSiNo(mixed $valor): string
    {
        if (is_bool($valor)) {
            return $valor ? 'S' : 'N';
        }

        $normalizado = mb_strtolower(trim((string) $valor));

        return match ($normalizado) {
            '1', 'true', 't', 's', 'si', 'sí', 'yes', 'y' => 'S',
            '0', 'false', 'f', 'n', 'no' => 'N',
            default => throw new RuntimeException("Valor no reconocido en campo de si/no: {$valor}"),
        };
    }

    private function cambiarTipoEnPostgres(string $campo, string $tipo, string $expresion): void
    {
        DB::statement("ALTER TABLE \"visitas_extensionismo\" ALTER COLUMN \"{$campo}\" TYPE {$tipo} USING ({$expresion})");
    }
};
