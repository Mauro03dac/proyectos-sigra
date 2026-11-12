<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RazaPecuaria extends Model
{
    protected $table = 'razas_pecuarias';

    protected $primaryKey = 'raza_pecuaria';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['codigo', 'grupo', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }
}
