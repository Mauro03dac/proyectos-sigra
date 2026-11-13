<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vereda extends Model
{
    protected $table = 'veredas';

    protected $primaryKey = 'vereda';

    protected $fillable = ['corregimiento', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }

    /** @return BelongsTo<Corregimiento, $this> */
    public function corregimiento(): BelongsTo
    {
        return $this->belongsTo(Corregimiento::class, 'corregimiento', 'corregimiento');
    }
}
