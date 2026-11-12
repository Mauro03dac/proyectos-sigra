<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EspecieProductiva extends Model
{
    protected $table = 'especies_productivas';

    protected $primaryKey = 'especie_productiva';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['linea_productiva', 'codigo', 'nombre', 'grupo', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return BelongsTo<LineaProductiva, $this> */
    public function lineaProductiva(): BelongsTo
    {
        return $this->belongsTo(LineaProductiva::class, 'linea_productiva', 'linea_productiva');
    }

    /** @return HasMany<VisitaExtensionismo, $this> */
    public function visitasExtensionismo(): HasMany
    {
        return $this->hasMany(VisitaExtensionismo::class, 'especie_productiva', 'especie_productiva');
    }
}
