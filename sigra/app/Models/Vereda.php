<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vereda extends Model
{
    protected $table = 'veredas';

    protected $primaryKey = 'vereda';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['corregimiento', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return BelongsTo<Corregimiento, $this> */
    public function corregimiento(): BelongsTo
    {
        return $this->belongsTo(Corregimiento::class, 'corregimiento', 'corregimiento');
    }
}
