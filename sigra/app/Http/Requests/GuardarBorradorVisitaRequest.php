<?php

namespace App\Http\Requests;

use App\Models\VisitaExtensionismo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class GuardarBorradorVisitaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $normalizados = [];

        if ($this->exists('victima_conflicto_armado')) {
            $normalizados['victima_conflicto_armado'] = $this->normalizarSiNo($this->input('victima_conflicto_armado'));
        }
        if ($this->exists('sisben')) {
            $normalizados['afiliado_sisben'] = $this->normalizarSiNo($this->input('sisben'));
        }
        if ($this->exists('asociacion')) {
            $normalizados['afiliado_asociacion'] = $this->normalizarSiNo($this->input('asociacion'));
        }

        if ($this->exists('area_valor_ingresado')) {
            $unidad = $this->input('unidad_area_ingresada', 'hectareas');
            $valor = $this->normalizarSuperficie($this->input('area_valor_ingresado'));
            $normalizados['unidad_area_ingresada'] = $unidad;
            $normalizados['area_hectareas'] = $valor === null || ! in_array($unidad, ['areas', 'hectareas'], true)
                ? $valor
                : $this->convertirAHectareas($valor, $unidad);
        }

        $this->merge($normalizados);
    }

    private function normalizarSiNo(mixed $valor): mixed
    {
        if ($valor === null) {
            return null;
        }

        return match (mb_strtolower(trim((string) $valor))) {
            '1', 'true', 's', 'si', 'sí', 'yes', 'y' => 'S',
            '0', 'false', 'n', 'no' => 'N',
            default => $valor,
        };
    }

    private function normalizarSuperficie(mixed $valor): ?string
    {
        if ($valor === null || trim((string) $valor) === '') {
            return null;
        }

        $normalizado = str_replace(["\xC2\xA0", ' '], '', trim((string) $valor));
        if (str_contains($normalizado, ',')) {
            $normalizado = str_replace('.', '', $normalizado);
            $normalizado = str_replace(',', '.', $normalizado);
        }

        if (! preg_match('/^\d+(?:\.\d{1,6})?$/', $normalizado)) {
            return $normalizado;
        }

        return $normalizado;
    }

    private function convertirAHectareas(string $valor, string $unidad): string
    {
        if ($unidad === 'hectareas') {
            return $valor;
        }

        [$entero, $decimal] = array_pad(explode('.', $valor, 2), 2, '');
        $digitos = ltrim($entero.$decimal, '0');
        if ($digitos === '') {
            return '0';
        }

        $posicion = strlen($entero) - 2;
        if ($posicion > 0) {
            return substr($entero, 0, $posicion).'.'.substr($entero, $posicion).$decimal;
        }

        return '0.'.str_repeat('0', -$posicion).$entero.$decimal;
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return $this->reglasComunes();
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validarActividadProductiva($validator);
            $this->validarUbicacionPredio($validator);
        });
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'fotografias.array' => 'Las fotografías deben enviarse como archivos adjuntos.',
            'fotografias.*.uploaded' => 'No fue posible cargar la fotografía. Verifica el tamaño permitido por el servidor e inténtalo nuevamente.',
            'fotografias.*.image' => 'La fotografía debe ser una imagen válida.',
            'fotografias.*.mimes' => 'La fotografía debe estar en formato JPG, JPEG o PNG.',
            'fotografias.*.max' => 'Cada fotografía debe pesar máximo 5 MB.',
        ];
    }

    protected function actividadDebeEstarCompleta(): bool
    {
        return false;
    }

    /** @return array<string, array<int, string>> */
    protected function reglasComunes(): array
    {
        return [
            'visita_extensionismo' => ['nullable', 'integer', 'exists:visitas_extensionismo,visita_extensionismo'],
            'productor_existente' => ['nullable', 'integer', 'exists:productores,productor'],
            'predio_existente' => ['nullable', 'integer', 'exists:predios,predio'],
            'nombres' => ['nullable', 'string', 'max:150'],
            'apellidos' => ['nullable', 'string', 'max:150'],
            'tipo_documento' => ['nullable', 'string', 'max:20'],
            'numero_documento' => ['nullable', 'string', 'max:30'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'nombre_predio' => ['nullable', 'string', 'max:250'],
            'departamento' => ['nullable', 'string', 'max:5'],
            'divipola' => ['nullable', 'integer', 'exists:divipolas,divipola'],
            'corregimiento' => ['nullable', 'integer', 'exists:corregimientos,corregimiento'],
            'vereda' => ['nullable', 'integer', 'exists:veredas,vereda'],
            'fecha_visita' => ['nullable', 'date'],
            'latitud' => ['nullable', 'numeric'],
            'longitud' => ['nullable', 'numeric'],
            'linea_productiva_principal' => ['nullable', 'integer', 'exists:lineas_productivas,linea_productiva'],
            'especie_productiva' => ['nullable', 'integer', 'exists:especies_productivas,especie_productiva'],
            'linea_productiva_secundaria' => ['nullable', 'integer', 'exists:lineas_productivas,linea_productiva'],
            'linea_productiva_principal_otra' => ['nullable', 'string', 'max:255'],
            'especie_productiva_otra' => ['nullable', 'string', 'max:255'],
            'linea_productiva_secundaria_otra' => ['nullable', 'string', 'max:255'],
            'numero_animales' => ['nullable', 'integer', 'min:0'],
            'area_valor_ingresado' => ['nullable', 'string', 'regex:/^\d{1,13}(?:[.,]\d{1,6})?$/'],
            'unidad_area_ingresada' => ['nullable', 'in:areas,hectareas'],
            'area_hectareas' => ['nullable', 'numeric', 'min:0'],
            'tipo_discapacidad' => ['nullable', 'string', 'max:255'],
            'victima_conflicto_armado' => ['nullable', 'in:S,N'],
            'afiliado_sisben' => ['nullable', 'in:S,N'],
            'puntaje_sisben' => ['nullable', 'numeric', 'min:0'],
            'afiliado_asociacion' => ['nullable', 'in:S,N'],
            'nombre_asociacion' => ['nullable', 'string'],
            'aspecto_visita' => ['nullable', 'string'],
            'componente_visita' => ['nullable', 'string'],
            'diagnostico' => ['nullable', 'string'],
            'actividades_realizadas' => ['nullable', 'string'],
            'principales_proveedores' => ['nullable', 'string'],
            'principales_compradores' => ['nullable', 'string'],
            'fuentes_consulta' => ['nullable', 'string'],
            'recomendaciones' => ['nullable', 'string'],
            'compromisos' => ['nullable', 'string'],
            'nombre_extensionista' => ['nullable', 'string', 'max:300'],
            'numero_documento_extensionista' => ['nullable', 'string', 'max:30'],
            'disciplina_extensionista' => ['nullable', 'string', 'max:150'],
            'titulo_academico_extensionista' => ['nullable', 'string', 'max:200'],
            'enfoques_poblacionales' => ['nullable', 'array'],
            'enfoques_poblacionales.*' => ['integer', 'exists:enfoques_poblacionales,enfoque_poblacional'],
            'fotografias' => ['nullable', 'array'],
            'fotografias.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ];
    }

    private function validarActividadProductiva(Validator $validator): void
    {
        $principal = $this->filaLinea($this->input('linea_productiva_principal'));
        $secundaria = $this->filaLinea($this->input('linea_productiva_secundaria'));
        $especie = $this->filaEspecie($this->input('especie_productiva'));
        $principalOtra = trim((string) $this->input('linea_productiva_principal_otra', ''));
        $especieOtra = trim((string) $this->input('especie_productiva_otra', ''));
        $secundariaOtra = trim((string) $this->input('linea_productiva_secundaria_otra', ''));

        if ($principal === null) {
            if ($especie !== null) {
                $validator->errors()->add('especie_productiva', 'La especie requiere una línea productiva principal válida.');
            }
            if ($principalOtra !== '') {
                $validator->errors()->add('linea_productiva_principal_otra', 'Este campo ya no aplica a la línea productiva principal.');
            }
            if ($secundaria !== null) {
                $categoriaSecundaria = $this->categoriaLinea($secundaria->codigo);
                if ($categoriaSecundaria === null) {
                    $validator->errors()->add('linea_productiva_secundaria', 'La línea productiva secundaria no pertenece a las categorías aprobadas.');
                } elseif ($categoriaSecundaria === 'OTRA' && ! $this->lineaOtraPermitidaEnEdicion($secundaria, 'linea_productiva_secundaria')) {
                    $validator->errors()->add('linea_productiva_secundaria', 'Seleccione Agrícola o Pecuario para la línea productiva secundaria.');
                } elseif ($categoriaSecundaria !== 'OTRA' && $secundariaOtra !== '') {
                    $validator->errors()->add('linea_productiva_secundaria_otra', 'Este campo ya no aplica a la línea productiva secundaria.');
                }
            } elseif ($secundariaOtra !== '') {
                $validator->errors()->add('linea_productiva_secundaria_otra', 'Seleccione Agrícola o Pecuario antes de especificar la línea secundaria.');
            }

            return;
        }

        $categoriaPrincipal = $this->categoriaLinea($principal->codigo);

        if ($categoriaPrincipal === null) {
            $validator->errors()->add('linea_productiva_principal', 'La línea productiva principal no pertenece a las categorías aprobadas.');

            return;
        }

        if ($categoriaPrincipal === 'OTRA') {
            $esLineaHistorica = $this->lineaOtraPermitidaEnEdicion($principal, 'linea_productiva_principal');
            if (! $esLineaHistorica) {
                $validator->errors()->add('linea_productiva_principal', 'Seleccione Agrícola o Pecuario para la línea productiva principal.');
            }
            if ($especie !== null && ! $this->especieHistoricaPermitida($especie)) {
                $validator->errors()->add('especie_productiva', 'No se permite una especie cuando la línea principal es Otra.');
            }
            if ($especieOtra !== '' && ! $esLineaHistorica) {
                $validator->errors()->add('especie_productiva_otra', 'No se permite especificar una especie cuando la línea principal es Otra.');
            }
        } else {
            if ($principalOtra !== '') {
                $validator->errors()->add('linea_productiva_principal_otra', 'Este campo solo aplica cuando la línea principal es Otra.');
            }
            if ($especie === null) {
                if ($this->actividadDebeEstarCompleta()) {
                    $validator->errors()->add('especie_productiva', 'Seleccione una especie compatible con la línea principal.');
                }
            } else {
                $categoriaEspecie = $this->categoriaLinea($this->lineaDeEspecie($especie->linea_productiva));
                if ($categoriaEspecie !== $categoriaPrincipal) {
                    $validator->errors()->add('especie_productiva', 'La especie seleccionada no corresponde a la línea principal.');
                }

                $especieEsOtra = str_starts_with($especie->codigo, 'MI10_OTRA_');
                if ($especieEsOtra && $this->actividadDebeEstarCompleta() && $especieOtra === '') {
                    $validator->errors()->add('especie_productiva_otra', 'Especifique la especie.');
                }
                if (! $especieEsOtra && $especieOtra !== '') {
                    $validator->errors()->add('especie_productiva_otra', 'Este campo solo aplica cuando la especie es Otra.');
                }
            }
        }

        if ($secundaria !== null) {
            $categoriaSecundaria = $this->categoriaLinea($secundaria->codigo);
            if ($categoriaSecundaria === null) {
                $validator->errors()->add('linea_productiva_secundaria', 'La línea productiva secundaria no pertenece a las categorías aprobadas.');
            } elseif ($categoriaSecundaria === 'OTRA') {
                if (! $this->lineaOtraPermitidaEnEdicion($secundaria, 'linea_productiva_secundaria')) {
                    $validator->errors()->add('linea_productiva_secundaria', 'Seleccione Agrícola o Pecuario para la línea productiva secundaria.');
                }
            } elseif ($secundariaOtra !== '') {
                $validator->errors()->add('linea_productiva_secundaria_otra', 'Este campo solo aplica cuando la línea secundaria es Otra.');
            }
        } elseif ($secundariaOtra !== '') {
            $validator->errors()->add('linea_productiva_secundaria_otra', 'Seleccione Otra en la línea secundaria antes de especificarla.');
        }
    }

    private function validarUbicacionPredio(Validator $validator): void
    {
        $divipolaId = $this->input('divipola');
        $departamento = trim((string) $this->input('departamento', ''));
        $municipio = $divipolaId === null || $divipolaId === ''
            ? null
            : DB::table('divipolas')->where('divipola', (int) $divipolaId)->first(['divipola', 'codigo_departamento']);

        if ($municipio !== null && $departamento !== '' && (string) $municipio->codigo_departamento !== $departamento) {
            $validator->errors()->add('departamento', 'El departamento no corresponde al municipio seleccionado.');
        }

        $corregimientoId = $this->input('corregimiento');
        $corregimiento = $corregimientoId === null || $corregimientoId === ''
            ? null
            : DB::table('corregimientos')->where('corregimiento', (int) $corregimientoId)->first(['corregimiento', 'divipola']);

        if ($municipio !== null && $corregimiento !== null && (int) $corregimiento->divipola !== (int) $municipio->divipola) {
            $validator->errors()->add('corregimiento', 'El corregimiento no corresponde al municipio seleccionado.');
        }

        $veredaId = $this->input('vereda');
        $vereda = $veredaId === null || $veredaId === ''
            ? null
            : DB::table('veredas')->where('vereda', (int) $veredaId)->first(['vereda', 'corregimiento']);

        if ($corregimiento !== null && $vereda !== null && (int) $vereda->corregimiento !== (int) $corregimiento->corregimiento) {
            $validator->errors()->add('vereda', 'La vereda no corresponde al corregimiento seleccionado.');
        }
    }

    private function filaLinea(mixed $id): ?object
    {
        return $id === null || $id === '' ? null : DB::table('lineas_productivas')->where('linea_productiva', (int) $id)->first(['linea_productiva', 'codigo']);
    }

    private function filaEspecie(mixed $id): ?object
    {
        return $id === null || $id === '' ? null : DB::table('especies_productivas')->where('especie_productiva', (int) $id)->first(['especie_productiva', 'linea_productiva', 'codigo']);
    }

    private function lineaDeEspecie(int $lineaId): string
    {
        return (string) DB::table('lineas_productivas')->where('linea_productiva', $lineaId)->value('codigo');
    }

    private function lineaOtraPermitidaEnEdicion(?object $linea, string $campo): bool
    {
        if ($linea === null || $linea->codigo !== 'OTRA') {
            return false;
        }

        $visita = $this->route('visita');

        return $visita instanceof VisitaExtensionismo
            && (int) $visita->getAttribute($campo) === (int) $linea->linea_productiva;
    }

    private function especieHistoricaPermitida(?object $especie): bool
    {
        if ($especie === null) {
            return false;
        }

        $visita = $this->route('visita');

        return $visita instanceof VisitaExtensionismo
            && (int) $visita->getAttribute('especie_productiva') === (int) $especie->especie_productiva;
    }

    private function categoriaLinea(string $codigo): ?string
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
}
