<?php

namespace App\Http\Requests;

use App\Support\Ruea\PreguntasRuea;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

class GuardarBorradorRueaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'productor' => ['nullable', 'integer', 'exists:productores,productor'],
            'predio' => ['nullable', 'integer', 'exists:predios,predio'],
            'observaciones' => ['nullable', 'string'],
            'nombre_extensionista' => ['nullable', 'string', 'max:255'],
            'numero_documento_extensionista' => ['nullable', 'string', 'max:50'],
            'perfil_extensionista' => ['nullable', 'string', 'max:255'],
            'respuestas' => ['nullable', 'array'],
            'respuestas.*' => ['integer', 'in:1,2,3,4'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validarCodigosDeRespuesta($validator);
            $this->validarRelacionPredioProductor($validator);
            $this->validarRequisitosDefinitivos($validator);
        });
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'productor.required' => 'Selecciona un productor registrado antes de confirmar el RUEA.',
            'predio.required' => 'Selecciona un predio del productor antes de confirmar el RUEA.',
            'predio.exists' => 'El predio seleccionado ya no está disponible.',
            'respuestas.required' => 'Completa las 30 preguntas antes de confirmar el RUEA.',
            'respuestas.size' => 'Completa las 30 preguntas antes de confirmar el RUEA.',
            'respuestas.*.integer' => 'Cada respuesta RUEA debe ser un número válido.',
            'respuestas.*.in' => 'Cada respuesta RUEA debe estar entre 1 y 4.',
        ];
    }

    protected function validarRequisitosDefinitivos(Validator $validator): void {}

    protected function validarCodigosDeRespuesta(Validator $validator): void
    {
        $respuestas = $this->input('respuestas', []);

        if (! is_array($respuestas)) {
            return;
        }

        foreach (array_keys($respuestas) as $campo) {
            if (! is_string($campo) || ! array_key_exists($campo, PreguntasRuea::ETIQUETAS)) {
                $validator->errors()->add("respuestas.{$campo}", 'El código de pregunta RUEA no es válido.');
            }
        }
    }

    protected function validarRelacionPredioProductor(Validator $validator): void
    {
        $productor = $this->input('productor');
        $predio = $this->input('predio');

        if ($predio !== null && $predio !== '' && ($productor === null || $productor === '')) {
            $validator->errors()->add('productor', 'Selecciona el productor antes de seleccionar un predio.');

            return;
        }

        if ($productor === null || $productor === '' || $predio === null || $predio === '') {
            return;
        }

        $pertenece = DB::table('predios')
            ->where('predio', $predio)
            ->where('productor', $productor)
            ->exists();

        if (! $pertenece) {
            $validator->errors()->add('predio', 'El predio seleccionado no pertenece al productor.');
        }
    }
}
