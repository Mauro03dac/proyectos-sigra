<?php

namespace App\Http\Requests;

use App\Support\Ruea\PreguntasRuea;
use Illuminate\Validation\Validator;

class GuardarRueaRequest extends GuardarBorradorRueaRequest
{
    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'productor' => ['required', 'integer', 'exists:productores,productor'],
            'predio' => ['required', 'integer', 'exists:predios,predio'],
            'nombre_extensionista' => ['required', 'string', 'max:255'],
            'numero_documento_extensionista' => ['required', 'string', 'max:50'],
            'perfil_extensionista' => ['required', 'string', 'max:255'],
            'respuestas' => ['required', 'array', 'size:30'],
        ];
    }

    protected function validarRequisitosDefinitivos(Validator $validator): void
    {
        $respuestas = $this->input('respuestas', []);

        if (is_array($respuestas)) {
            foreach (array_diff(array_keys(PreguntasRuea::ETIQUETAS), array_keys($respuestas)) as $campo) {
                $validator->errors()->add("respuestas.{$campo}", 'Esta pregunta es obligatoria para registrar el RUEA.');
            }
        }
    }
}
