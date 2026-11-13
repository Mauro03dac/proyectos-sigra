<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RazaPecuaria extends Model
{
    protected $table = 'razas_pecuarias';

    protected $primaryKey = 'raza_pecuaria';

    protected $fillable = ['codigo', 'grupo', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }
}
