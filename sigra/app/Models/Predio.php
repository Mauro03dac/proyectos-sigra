<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Predio extends Model
{
    protected $table = 'predios';

    protected $primaryKey = 'predio';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['productor', 'nombre', 'divipola', 'corregimiento', 'vereda', 'latitud', 'longitud', 'hectareas', 'altitud_msnm'];

    protected function casts(): array
    {
        return ['latitud' => 'decimal:7', 'longitud' => 'decimal:7', 'hectareas' => 'decimal:2', 'altitud_msnm' => 'decimal:2', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return BelongsTo<Productor, $this> */
    public function productor(): BelongsTo
    {
        return $this->belongsTo(Productor::class, 'productor', 'productor');
    }

    /** @return BelongsTo<Divipola, $this> */
    public function divipola(): BelongsTo
    {
        return $this->belongsTo(Divipola::class, 'divipola', 'divipola');
    }

    /** @return BelongsTo<Corregimiento, $this> */
    public function corregimiento(): BelongsTo
    {
        return $this->belongsTo(Corregimiento::class, 'corregimiento', 'corregimiento');
    }

    /** @return BelongsTo<Vereda, $this> */
    public function vereda(): BelongsTo
    {
        return $this->belongsTo(Vereda::class, 'vereda', 'vereda');
    }

    /** @return HasMany<VisitaExtensionismo, $this> */
    public function visitasExtensionismo(): HasMany
    {
        return $this->hasMany(VisitaExtensionismo::class, 'predio', 'predio');
    }
}
