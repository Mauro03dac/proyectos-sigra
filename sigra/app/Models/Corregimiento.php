<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Corregimiento extends Model
{
    protected $table = 'corregimientos';

    protected $primaryKey = 'corregimiento';

    protected $fillable = ['divipola', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
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
