<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Archivo extends Model
{
    protected $table = 'archivos';

    protected $primaryKey = 'archivo';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = null;

    protected $fillable = ['nombre_original', 'nombre_almacenado', 'ruta', 'disco', 'tipo_mime', 'tamano'];

    protected function casts(): array
    {
        return ['tamano' => 'integer', 'fecha_creacion' => 'datetime'];
    }

    /** @return HasMany<Anexo, $this> */
    public function anexos(): HasMany
    {
        return $this->hasMany(Anexo::class, 'archivo', 'archivo');
    }
}
