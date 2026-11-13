<?php

namespace App\Servicios;

use App\Models\Archivo;
use App\Models\EnfoquePoblacional;
use App\Models\Predio;
use App\Models\Productor;
use App\Models\VisitaBorrador;
use App\Models\VisitaExtensionismo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ServicioVisitasExtensionismo
{
    /** @var array<string, array{0: string, 1: string}> */
    private const CAMPOS_PRODUCTOR_BORRADOR = [
        'nombres' => ['nombres_productor', 'nombres'],
        'apellidos' => ['apellidos_productor', 'apellidos'],
        'tipo_documento' => ['tipo_documento', 'tipo_documento'],
        'numero_documento' => ['numero_documento', 'numero_documento'],
        'telefono' => ['telefono_productor', 'telefono'],
        'sexo' => ['sexo_productor', 'sexo'],
    ];

    /** @var array<string, array{0: string, 1: string}> */
    private const CAMPOS_PREDIO_BORRADOR = [
        'nombre_predio' => ['nombre_predio', 'nombre'],
        'divipola' => ['divipola', 'divipola'],
        'corregimiento' => ['corregimiento', 'corregimiento'],
        'vereda' => ['vereda', 'vereda'],
        'latitud' => ['latitud', 'latitud'],
        'longitud' => ['longitud', 'longitud'],
    ];

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
                $productor = $definitivo
                    ? $this->resolverProductor($datos, $usuario)
                    : $this->resolverProductorExistenteEnBorrador($datos);
                $predio = $definitivo
                    ? $this->resolverPredio($datos, $productor)
                    : $this->resolverPredioExistenteEnBorrador($datos, $productor);
                $actividad = $this->resolverActividadProductiva($datos, $visita);
                $visita->fill([
                    ...Arr::except($datos, [
                        'fotografias', 'enfoques_poblacionales', 'productor', 'predio', 'area_valor_ingresado',
                        'departamento',
                        'linea_productiva_principal', 'linea_productiva_secundaria', 'especie_productiva',
                        'linea_productiva_principal_otra', 'especie_productiva_otra', 'linea_productiva_secundaria_otra',
                    ]),
                    ...$actividad,
                ]);
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
                $cambiosVisita = $visita->getDirty();
                $visita->save();
                $cambiosBorrador = $definitivo
                    ? $this->consolidarBorrador($visita, $datos, $productor, $predio)
                    : $this->guardarBorrador($visita, $datos);
                $enfoquesAntes = $visita->enfoquesPoblacionales()->pluck('enfoques_poblacionales.enfoque_poblacional')->sort()->values()->all();
                $enfoques = EnfoquePoblacional::query()->whereIn('enfoque_poblacional', $datos['enfoques_poblacionales'] ?? [])->pluck('enfoque_poblacional')->sort()->values()->all();
                $visita->enfoquesPoblacionales()->sync($enfoques);
                $this->guardarFotografias($visita, $datos['fotografias'] ?? [], $rutasNuevas);
                $cambios = [];
                foreach ($cambiosVisita as $campo => $nuevo) {
                    if (! in_array($campo, ['created_at', 'updated_at'], true)) {
                        $cambios[$campo] = ['anterior' => $antes[$campo] ?? null, 'nuevo' => $nuevo];
                    }
                }
                $cambios = [...$cambios, ...$cambiosBorrador];
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
    private function resolverProductorExistenteEnBorrador(array $datos): ?Productor
    {
        if (empty($datos['productor_existente'])) {
            return null;
        }

        $productor = Productor::query()->where('productor', $datos['productor_existente'])->firstOrFail();
        if (($datos['tipo_documento'] ?? '') !== '' && ($datos['numero_documento'] ?? '') !== ''
            && ($productor->tipo_documento !== $datos['tipo_documento'] || $productor->numero_documento !== $datos['numero_documento'])) {
            abort(422, 'El productor seleccionado no coincide con el documento ingresado.');
        }

        return $productor;
    }

    /** @param array<string,mixed> $datos */
    private function resolverPredioExistenteEnBorrador(array $datos, ?Productor $productor): ?Predio
    {
        if (empty($datos['predio_existente']) || $productor === null) {
            return null;
        }

        return Predio::query()
            ->where('productor', $productor->getKey())
            ->where('predio', $datos['predio_existente'])
            ->firstOrFail();
    }

    /** @param array<string,mixed> $datos */
    private function resolverPredio(array $datos, Productor $productor): Predio
    {
        if (! empty($datos['predio_existente'])) {
            return Predio::query()->where('productor', $productor->getKey())->where('predio', $datos['predio_existente'])->firstOrFail();
        }

        return Predio::query()->create(['productor' => $productor->getKey(), 'nombre' => $datos['nombre_predio'], 'divipola' => $datos['divipola'], 'corregimiento' => $datos['corregimiento'] ?? null, 'vereda' => $datos['vereda'] ?? null, 'latitud' => $datos['latitud'] ?? null, 'longitud' => $datos['longitud'] ?? null]);
    }

    /** @param array<string, mixed> $datos */
    private function resolverActividadProductiva(array $datos, VisitaExtensionismo $visita): array
    {
        if (! array_key_exists('linea_productiva_principal', $datos)
            && ! array_key_exists('linea_productiva_secundaria', $datos)
            && ! array_key_exists('especie_productiva', $datos)
            && ! array_key_exists('linea_productiva_principal_otra', $datos)
            && ! array_key_exists('especie_productiva_otra', $datos)
            && ! array_key_exists('linea_productiva_secundaria_otra', $datos)) {
            return [];
        }

        $principalSolicitado = $this->filaLinea($datos['linea_productiva_principal'] ?? null);
        if ($principalSolicitado === null) {
            return [];
        }

        $categoriaPrincipal = $this->categoriaDeCodigoLinea($principalSolicitado->codigo);
        if ($categoriaPrincipal === null) {
            return [];
        }

        $principalActual = $this->filaLinea($visita->getAttribute('linea_productiva_principal'));
        $especieSolicitada = $this->filaEspecie($datos['especie_productiva'] ?? null);
        $especieActual = $this->filaEspecie($visita->getAttribute('especie_productiva'));
        $semanticaEspecieSolicitada = $this->semanticaEspecie($especieSolicitada);
        $semanticaEspecieActual = $this->semanticaEspecie($especieActual);
        $principalSinCambio = $principalActual !== null
            && $this->categoriaDeCodigoLinea($principalActual->codigo) === $categoriaPrincipal
            && ($categoriaPrincipal === 'OTRA' || $semanticaEspecieActual === $semanticaEspecieSolicitada);
        $principalOtra = array_key_exists('linea_productiva_principal_otra', $datos)
            ? $this->texto($datos['linea_productiva_principal_otra'])
            : ($principalSinCambio && $categoriaPrincipal === 'OTRA'
                ? $this->texto($visita->getAttribute('linea_productiva_principal_otra'))
                : null);
        $especieOtra = array_key_exists('especie_productiva_otra', $datos)
            ? $this->texto($datos['especie_productiva_otra'])
            : ($principalSinCambio && $semanticaEspecieActual === 'OTRA'
                ? $this->texto($visita->getAttribute('especie_productiva_otra'))
                : null);

        $lineaPrincipal = $principalSinCambio
            ? (int) $principalActual->linea_productiva
            : $this->idLineaCanonica($categoriaPrincipal);
        $especie = $categoriaPrincipal === 'OTRA'
            ? ($principalSinCambio && $especieActual !== null ? (int) $especieActual->especie_productiva : null)
            : ($principalSinCambio && $especieActual !== null
                ? (int) $especieActual->especie_productiva
                : $this->idEspecieCanonica($categoriaPrincipal, $semanticaEspecieSolicitada));

        $secundariaSolicitada = $this->filaLinea($datos['linea_productiva_secundaria'] ?? null);
        $secundariaActual = $this->filaLinea($visita->getAttribute('linea_productiva_secundaria'));
        $categoriaSecundaria = $secundariaSolicitada === null
            ? null
            : $this->categoriaDeCodigoLinea($secundariaSolicitada->codigo);
        $secundariaSinCambio = $secundariaSolicitada !== null
            && $secundariaActual !== null
            && $this->categoriaDeCodigoLinea($secundariaActual->codigo) === $categoriaSecundaria;
        $secundariaOtra = array_key_exists('linea_productiva_secundaria_otra', $datos)
            ? $this->texto($datos['linea_productiva_secundaria_otra'])
            : ($secundariaSinCambio && $categoriaSecundaria === 'OTRA'
                ? $this->texto($visita->getAttribute('linea_productiva_secundaria_otra'))
                : null);

        return [
            'linea_productiva_principal' => $lineaPrincipal,
            'especie_productiva' => $especie,
            'linea_productiva_principal_otra' => $categoriaPrincipal === 'OTRA' ? $principalOtra : null,
            'especie_productiva_otra' => $this->especieEsOtra($semanticaEspecieSolicitada) ? $especieOtra : null,
            'linea_productiva_secundaria' => $secundariaSolicitada === null
                ? null
                : ($secundariaSinCambio ? (int) $secundariaActual->linea_productiva : $this->idLineaCanonica($categoriaSecundaria)),
            'linea_productiva_secundaria_otra' => $categoriaSecundaria === 'OTRA' ? $secundariaOtra : null,
        ];
    }

    private function filaLinea(mixed $id): ?object
    {
        return $id === null || $id === '' ? null : DB::table('lineas_productivas')->where('linea_productiva', (int) $id)->first(['linea_productiva', 'codigo']);
    }

    private function filaEspecie(mixed $id): ?object
    {
        return $id === null || $id === '' ? null : DB::table('especies_productivas')->where('especie_productiva', (int) $id)->first(['especie_productiva', 'linea_productiva', 'codigo']);
    }

    private function categoriaDeCodigoLinea(string $codigo): ?string
    {
        if (in_array($codigo, ['AGRICOLA', 'PECUARIO', 'OTRA'], true)) {
            return $codigo;
        }

        if (in_array($codigo, ['ARROZ', 'CACAO', 'CAFE', 'PLATANO_BANANO', 'MAIZ', 'YUCA', 'CANA', 'PALMA_ACEITE', 'PINA', 'FRUTICULTURA', 'CITRICULTURA', 'SORGO'], true)) {
            return 'AGRICOLA';
        }

        if (in_array($codigo, ['GANADERIA_BOVINA', 'PRODUCCION_EQUINA', 'PISCICULTURA', 'AVICULTURA', 'PORCICULTURA', 'OVINOCULTURA'], true)) {
            return 'PECUARIO';
        }

        return null;
    }

    private function semanticaEspecie(?object $especie): ?string
    {
        if ($especie === null) {
            return null;
        }

        return match ($especie->codigo) {
            'BOVINO', 'MI10_BOVINO' => 'BOVINO',
            'EQUINO', 'MI10_EQUINO' => 'EQUINO',
            'AVE', 'MI10_AVICOLA' => 'AVICOLA',
            'PORCINO', 'MI10_PORCINO' => 'PORCINO',
            'OVINO', 'MI10_OVINO' => 'OVINO',
            'MI10_PISCICOLA', 'CACHAMA', 'MOJARRA', 'YAMU', 'BAGRE', 'BOCACHICO' => 'PISCICOLA',
            'MI10_OTRA_AGRICOLA', 'MI10_OTRA_PECUARIO' => 'OTRA',
            default => str_starts_with($especie->codigo, 'MI10_') ? substr($especie->codigo, 5) : $especie->codigo,
        };
    }

    private function idLineaCanonica(?string $categoria): ?int
    {
        return $categoria === null ? null : DB::table('lineas_productivas')->where('codigo', $categoria)->value('linea_productiva');
    }

    private function idEspecieCanonica(string $categoria, ?string $semantica): ?int
    {
        if ($semantica === null || $semantica === '') {
            return null;
        }

        $codigo = $semantica === 'OTRA'
            ? ($categoria === 'AGRICOLA' ? 'MI10_OTRA_AGRICOLA' : 'MI10_OTRA_PECUARIO')
            : 'MI10_'.$semantica;

        return DB::table('especies_productivas')->where('codigo', $codigo)->where('linea_productiva', $this->idLineaCanonica($categoria))->value('especie_productiva');
    }

    private function especieEsOtra(?string $semantica): bool
    {
        return $semantica === 'OTRA';
    }

    private function texto(mixed $valor): ?string
    {
        $texto = trim((string) ($valor ?? ''));

        return $texto === '' ? null : $texto;
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function camposBorrador(array $datos): array
    {
        $campos = [];

        foreach ([...self::CAMPOS_PRODUCTOR_BORRADOR, ...self::CAMPOS_PREDIO_BORRADOR] as $entrada => [$temporal]) {
            if (array_key_exists($entrada, $datos)) {
                $campos[$temporal] = $datos[$entrada];
            }
        }

        return $campos;
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function guardarBorrador(VisitaExtensionismo $visita, array $datos): array
    {
        $campos = $this->camposBorrador($datos);
        $borrador = $visita->borrador;

        if ($borrador === null && ! $this->contieneDatos($campos)) {
            return [];
        }

        $borrador ??= new VisitaBorrador(['visita_extensionismo' => $visita->getKey()]);
        $antes = $borrador->getAttributes();
        $borrador->fill($campos);

        if (! $this->contieneDatos($borrador->only($this->camposTemporales()))) {
            if (! $borrador->exists) {
                return [];
            }

            $borrador->delete();
            $visita->unsetRelation('borrador');

            return $this->cambiosEliminacionBorrador($antes);
        }

        if (! $borrador->isDirty()) {
            return [];
        }

        $cambios = $borrador->getDirty();
        $borrador->save();
        $visita->setRelation('borrador', $borrador);

        return $this->cambiosBorrador($cambios, $antes);
    }

    /**
     * @param  array<string, mixed>  $datos
     * @param  array<string, array{0: string, 1: string}>  $mapeo
     * @return array<string, mixed>
     */
    private function consolidarBorrador(VisitaExtensionismo $visita, array $datos, Productor $productor, Predio $predio): array
    {
        $borrador = $visita->borrador;

        if ($borrador === null) {
            return [];
        }

        $antes = $borrador->getAttributes();
        $this->consolidarCampos($borrador, $datos, $productor, self::CAMPOS_PRODUCTOR_BORRADOR);
        $this->consolidarCampos($borrador, $datos, $predio, self::CAMPOS_PREDIO_BORRADOR);

        if ($this->contieneDatos($borrador->only($this->camposTemporales()))) {
            if (! $borrador->isDirty()) {
                return [];
            }

            $cambios = $borrador->getDirty();
            $borrador->save();

            return $this->cambiosBorrador($cambios, $antes);
        }

        $borrador->delete();
        $visita->unsetRelation('borrador');

        return $this->cambiosEliminacionBorrador($antes);
    }

    /** @param array<string, array{0: string, 1: string}> $mapeo */
    private function consolidarCampos(VisitaBorrador $borrador, array $datos, Productor|Predio $definitivo, array $mapeo): void
    {
        foreach ($mapeo as $entrada => [$temporal, $campoDefinitivo]) {
            $incluido = array_key_exists($entrada, $datos);
            $valorTemporal = $incluido ? $datos[$entrada] : $borrador->getAttribute($temporal);

            if ($this->equivalentes($valorTemporal, $definitivo->getAttribute($campoDefinitivo), $temporal)) {
                $borrador->setAttribute($temporal, null);
            } elseif ($incluido) {
                $borrador->setAttribute($temporal, $valorTemporal);
            }
        }
    }

    private function equivalentes(mixed $temporal, mixed $definitivo, string $campoTemporal): bool
    {
        if ($temporal === null || $definitivo === null) {
            return $temporal === $definitivo;
        }

        if (in_array($campoTemporal, ['divipola', 'corregimiento', 'vereda', 'latitud', 'longitud'], true)) {
            return is_numeric($temporal)
                && is_numeric($definitivo)
                && abs((float) $temporal - (float) $definitivo) < 0.0000001;
        }

        return (string) $temporal === (string) $definitivo;
    }

    /** @return array<int, string> */
    private function camposTemporales(): array
    {
        return array_values(array_map(fn (array $campos): string => $campos[0], [...self::CAMPOS_PRODUCTOR_BORRADOR, ...self::CAMPOS_PREDIO_BORRADOR]));
    }

    /** @param array<string, mixed> $campos */
    private function contieneDatos(array $campos): bool
    {
        return collect($campos)->contains(fn (mixed $valor): bool => $valor !== null);
    }

    /**
     * @param  array<string, mixed>  $cambios
     * @param  array<string, mixed>  $antes
     * @return array<string, array{anterior: mixed, nuevo: mixed}>
     */
    private function cambiosBorrador(array $cambios, array $antes): array
    {
        $resultado = [];

        foreach ($cambios as $campo => $nuevo) {
            if (in_array($campo, ['visita_extensionismo', 'created_at', 'updated_at'], true)) {
                continue;
            }

            $resultado["borrador.{$campo}"] = ['anterior' => $antes[$campo] ?? null, 'nuevo' => $nuevo];
        }

        return $resultado;
    }

    /**
     * @param  array<string, mixed>  $antes
     * @return array<string, array{anterior: mixed, nuevo: null}>
     */
    private function cambiosEliminacionBorrador(array $antes): array
    {
        $resultado = [];

        foreach ($this->camposTemporales() as $campo) {
            if (($antes[$campo] ?? null) !== null) {
                $resultado["borrador.{$campo}"] = ['anterior' => $antes[$campo], 'nuevo' => null];
            }
        }

        return $resultado;
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
