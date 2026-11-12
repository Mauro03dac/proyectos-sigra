<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Divipola extends Model
{
    protected $table = 'divipolas';

    protected $primaryKey = 'divipola';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['codigo_departamento', 'nombre_departamento', 'codigo_municipio', 'nombre_municipio', 'tipo_municipio', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return HasMany<Corregimiento, $this> */
    public function corregimientos(): HasMany
    {
        return $this->hasMany(Corregimiento::class, 'divipola', 'divipola');
    }

    /** @return HasMany<Predio, $this> */
    public function predios(): HasMany
    {
        return $this->hasMany(Predio::class, 'divipola', 'divipola');
    }
}
