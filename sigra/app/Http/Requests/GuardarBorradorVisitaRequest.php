<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GuardarBorradorVisitaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $normalizar = fn (mixed $valor): mixed => in_array($valor, [true, 1, '1', 'Sí', 'si'], true) ? true : (in_array($valor, [false, 0, '0', 'No', 'no'], true) ? false : $valor);
        $this->merge(['victima_conflicto_armado' => $normalizar($this->input('victima_conflicto_armado')), 'afiliado_sisben' => $normalizar($this->input('sisben')), 'afiliado_asociacion' => $normalizar($this->input('asociacion'))]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->reglasComunes();
    }

    /** @return array<string, array<int, string>> */
    protected function reglasComunes(): array
    {
        return ['visita_extensionismo' => ['nullable', 'integer', 'exists:visitas_extensionismo,visita_extensionismo'], 'productor_existente' => ['nullable', 'integer', 'exists:productores,productor'], 'predio_existente' => ['nullable', 'integer', 'exists:predios,predio'], 'nombres' => ['nullable', 'string', 'max:150'], 'apellidos' => ['nullable', 'string', 'max:150'], 'tipo_documento' => ['nullable', 'string', 'max:20'], 'numero_documento' => ['nullable', 'string', 'max:30'], 'telefono' => ['nullable', 'string', 'max:30'], 'fecha_nacimiento' => ['nullable', 'date'], 'sexo' => ['nullable', 'string', 'max:20'], 'nombre_predio' => ['nullable', 'string', 'max:250'], 'divipola' => ['nullable', 'integer', 'exists:divipolas,divipola'], 'corregimiento' => ['nullable', 'integer', 'exists:corregimientos,corregimiento'], 'vereda' => ['nullable', 'integer', 'exists:veredas,vereda'], 'fecha_visita' => ['nullable', 'date'], 'latitud' => ['nullable', 'numeric'], 'longitud' => ['nullable', 'numeric'], 'linea_productiva_principal' => ['nullable', 'integer', 'exists:lineas_productivas,linea_productiva'], 'especie_productiva' => ['nullable', 'integer', 'exists:especies_productivas,especie_productiva'], 'linea_productiva_secundaria' => ['nullable', 'integer', 'exists:lineas_productivas,linea_productiva'], 'numero_animales' => ['nullable', 'integer', 'min:0'], 'area_hectareas' => ['nullable', 'numeric', 'min:0'], 'tipo_discapacidad' => ['nullable', 'string', 'max:255'], 'victima_conflicto_armado' => ['nullable', 'boolean'], 'afiliado_sisben' => ['nullable', 'boolean'], 'puntaje_sisben' => ['nullable', 'numeric', 'min:0'], 'afiliado_asociacion' => ['nullable', 'boolean'], 'nombre_asociacion' => ['nullable', 'string'], 'aspecto_visita' => ['nullable', 'string'], 'componente_visita' => ['nullable', 'string'], 'diagnostico' => ['nullable', 'string'], 'actividades_realizadas' => ['nullable', 'string'], 'principales_proveedores' => ['nullable', 'string'], 'principales_compradores' => ['nullable', 'string'], 'fuentes_consulta' => ['nullable', 'string'], 'recomendaciones' => ['nullable', 'string'], 'compromisos' => ['nullable', 'string'], 'nombre_extensionista' => ['nullable', 'string', 'max:300'], 'numero_documento_extensionista' => ['nullable', 'string', 'max:30'], 'disciplina_extensionista' => ['nullable', 'string', 'max:150'], 'titulo_academico_extensionista' => ['nullable', 'string', 'max:200'], 'enfoques_poblacionales' => ['nullable', 'array'], 'enfoques_poblacionales.*' => ['integer', 'exists:enfoques_poblacionales,enfoque_poblacional'], 'fotografias' => ['nullable', 'array'], 'fotografias.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120']];
    }
}
