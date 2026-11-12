<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Corregimiento extends Model
{
    protected $table = 'corregimientos';

    protected $primaryKey = 'corregimiento';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['divipola', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return BelongsTo<Divipola, $this> */
    public function divipola(): BelongsTo
    {
        return $this->belongsTo(Divipola::class, 'divipola', 'divipola');
    }

    /** @return HasMany<Vereda, $this> */
    public function veredas(): HasMany
    {
        return $this->hasMany(Vereda::class, 'corregimiento', 'corregimiento');
    }
}
