<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;

class GuardarVisitaRequest extends GuardarBorradorVisitaRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'nombres' => ['required', 'string', 'max:150'],
            'apellidos' => ['required', 'string', 'max:150'],
            'tipo_documento' => ['required', 'string', 'max:20'],
            'numero_documento' => ['required', 'string', 'min:3', 'max:30'],
            'telefono' => ['required', 'string', 'max:30'],
            'sexo' => ['required', 'string', 'max:20'],
            'nombre_predio' => ['required_without:predio_existente', 'string', 'max:250'],
            'divipola' => ['required_without:predio_existente', 'integer', 'exists:divipolas,divipola'],
            'fecha_visita' => ['required', 'date'],
            'latitud' => ['required_without:predio_existente', 'numeric'],
            'longitud' => ['required_without:predio_existente', 'numeric'],
            'linea_productiva_principal' => ['required', 'integer', 'exists:lineas_productivas,linea_productiva'],
            'numero_animales' => ['required', 'integer', 'min:0'],
            'area_hectareas' => ['required', 'numeric', 'min:0'],
            'victima_conflicto_armado' => ['required', 'in:S,N'],
            'aspecto_visita' => ['required', 'string'],
            'componente_visita' => ['required', 'string'],
            'diagnostico' => ['required', 'string'],
            'actividades_realizadas' => ['required', 'string'],
            'recomendaciones' => ['required', 'string'],
            'compromisos' => ['required', 'string'],
            'nombre_extensionista' => ['required', 'string', 'max:300'],
            'numero_documento_extensionista' => ['required', 'string', 'max:30'],
            'disciplina_extensionista' => ['required', 'string', 'max:150'],
            'titulo_academico_extensionista' => ['required', 'string', 'max:200'],
        ];
    }

    protected function actividadDebeEstarCompleta(): bool
    {
        return true;
    }
}
