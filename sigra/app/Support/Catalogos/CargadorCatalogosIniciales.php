<?php

namespace App\Support\Catalogos;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class CargadorCatalogosIniciales
{
    public const FUENTE_DIVIPOLA = 'https://www.datos.gov.co/resource/gdxc-w37w.csv?$limit=5000';

    public const FECHA_OBTENCION_DIVIPOLA = '2026-11-12';

    public function cargarTodos(): void
    {
        $this->cargarDivipolas();
        $this->cargarLocalidadesYopal();
        $this->cargarEnfoquesPoblacionales();
        $this->cargarLineasProductivas();
        $this->cargarEspeciesProductivas();
        $this->cargarCultivos();
        $this->cargarRazasPecuarias();
    }

    public function cargarDivipolas(): void
    {
        $rows = $this->leerCsv(
            'divipolas.csv',
            ['cod_dpto', 'dpto', 'cod_mpio', 'nom_mpio', 'tipo_municipio', 'longitud', 'latitud'],
            ',',
        );

        if (count($rows) !== 1122 || count(array_unique(array_column($rows, 2))) !== 1122) {
            throw new RuntimeException('El archivo local DIVIPOLA no contiene 1.122 códigos municipales únicos.');
        }

        $this->insertarIgnorandoDuplicados('divipolas', array_map(fn (array $row): array => [
            'codigo_departamento' => $row[0],
            'nombre_departamento' => $row[1],
            'codigo_municipio' => $row[2],
            'nombre_municipio' => $row[3],
            'tipo_municipio' => $row[4] ?: null,
            'activo' => true,
        ], $rows));
    }

    public function cargarLocalidadesYopal(): void
    {
        $rows = $this->leerCsv('localidades_yopal.csv', ['corregimiento', 'localidad'], '|');
        $totalesEsperados = [
            'CHARTE' => 15,
            'MORRO' => 18,
            'CHAPARRERA' => 6,
            'MATA DE LIMON' => 6,
            'LA NIATA' => 10,
            'QUEBRADA SECA' => 3,
            'TILODIRAN' => 8,
            'TACARIMENA' => 9,
            'PUNTO NUEVO' => 6,
            'TALADRO' => 4,
            'MORICHAL' => 14,
        ];
        $totalesActuales = [];

        foreach ($rows as [$corregimiento]) {
            $totalesActuales[$corregimiento] = ($totalesActuales[$corregimiento] ?? 0) + 1;
        }

        if (count($rows) !== 99 || $totalesActuales !== $totalesEsperados) {
            throw new RuntimeException('El archivo local de localidades de Yopal no coincide con los 99 registros suministrados.');
        }

        $divipola = DB::table('divipolas')->where('codigo_municipio', '85001')->value('divipola');

        if ($divipola === null) {
            throw new RuntimeException('No se encontró Yopal (85001) en el catálogo DIVIPOLA local.');
        }

        $this->insertarIgnorandoDuplicados('corregimientos', array_map(fn (string $nombre): array => [
            'divipola' => $divipola,
            'nombre' => $nombre,
            'activo' => true,
        ], array_keys($totalesEsperados)));

        $corregimientos = DB::table('corregimientos')
            ->where('divipola', $divipola)
            ->pluck('corregimiento', 'nombre');

        $this->insertarIgnorandoDuplicados('veredas', array_map(function (array $row) use ($corregimientos): array {
            $corregimiento = $corregimientos[$row[0]] ?? null;

            if ($corregimiento === null) {
                throw new RuntimeException("No se encontró el corregimiento [{$row[0]}] para cargar sus localidades.");
            }

            return [
                'corregimiento' => $corregimiento,
                'nombre' => $row[1],
                'activo' => true,
            ];
        }, $rows));
    }

    public function cargarEnfoquesPoblacionales(): void
    {
        $rows = $this->leerCsv('enfoques_poblacionales.csv', ['codigo', 'nombre'], '|');
        $this->insertarIgnorandoDuplicados('enfoques_poblacionales', array_map(fn (array $row): array => [
            'codigo' => $row[0],
            'nombre' => $row[1],
            'activo' => true,
        ], $rows));
    }

    public function cargarLineasProductivas(): void
    {
        $rows = $this->leerCsv('lineas_productivas.csv', ['codigo', 'nombre'], '|');
        $this->insertarIgnorandoDuplicados('lineas_productivas', array_map(fn (array $row): array => [
            'codigo' => $row[0],
            'nombre' => $row[1],
            'descripcion' => null,
            'activo' => true,
        ], $rows));
    }

    public function cargarEspeciesProductivas(): void
    {
        $rows = $this->leerCsv('especies_productivas.csv', ['linea_productiva', 'codigo', 'nombre', 'grupo'], '|');
        $this->insertarCatalogoProductivo('especies_productivas', $rows);
    }

    public function cargarCultivos(): void
    {
        $rows = $this->leerCsv('cultivos.csv', ['linea_productiva', 'codigo', 'nombre', 'grupo'], '|');
        $this->insertarCatalogoProductivo('cultivos', $rows);
    }

    public function cargarRazasPecuarias(): void
    {
        $rows = $this->leerCsv('razas_pecuarias.csv', ['grupo', 'codigo', 'nombre'], '|');
        $this->insertarIgnorandoDuplicados('razas_pecuarias', array_map(fn (array $row): array => [
            'grupo' => $row[0],
            'codigo' => $row[1],
            'nombre' => $row[2],
            'activo' => true,
        ], $rows));
    }

    /**
     * @param  array<int, array<int, string>>  $rows
     */
    private function insertarCatalogoProductivo(string $tabla, array $rows): void
    {
        $lineas = DB::table('lineas_productivas')->pluck('linea_productiva', 'codigo');

        $this->insertarIgnorandoDuplicados($tabla, array_map(function (array $row) use ($lineas): array {
            $lineaProductiva = $lineas[$row[0]] ?? null;

            if ($lineaProductiva === null) {
                throw new RuntimeException("No se encontró la línea productiva [{$row[0]}].");
            }

            return [
                'linea_productiva' => $lineaProductiva,
                'codigo' => $row[1],
                'nombre' => $row[2],
                'grupo' => $row[3],
                'activo' => true,
            ];
        }, $rows));
    }

    /**
     * @param  array<int, string>  $encabezadoEsperado
     * @return array<int, array<int, string>>
     */
    private function leerCsv(string $archivo, array $encabezadoEsperado, string $separador): array
    {
        $ruta = database_path("data/{$archivo}");
        $recurso = fopen($ruta, 'r');

        if ($recurso === false) {
            throw new RuntimeException("No se pudo leer el catálogo local [{$archivo}].");
        }

        $encabezado = fgetcsv($recurso, separator: $separador, escape: '');

        if ($encabezado !== $encabezadoEsperado) {
            fclose($recurso);

            throw new RuntimeException("El encabezado de [{$archivo}] no coincide con su estructura esperada.");
        }

        $rows = [];

        while (($row = fgetcsv($recurso, separator: $separador, escape: '')) !== false) {
            if ($row === [null]) {
                continue;
            }

            if (count($row) !== count($encabezadoEsperado)) {
                fclose($recurso);

                throw new RuntimeException("El catálogo local [{$archivo}] contiene una fila inválida.");
            }

            $rows[] = $row;
        }

        fclose($recurso);

        return $rows;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function insertarIgnorandoDuplicados(string $tabla, array $rows): void
    {
        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table($tabla)->insertOrIgnore($chunk);
        }
    }
}
