<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitaEnfoquePoblacional extends Model
{
    protected $table = 'visitas_enfoques_poblacionales';

    protected $primaryKey = 'visita_enfoque_poblacional';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['visita_extensionismo', 'enfoque_poblacional'];

    protected function casts(): array
    {
        return ['fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return BelongsTo<VisitaExtensionismo, $this> */
    public function visitaExtensionismo(): BelongsTo
    {
        return $this->belongsTo(VisitaExtensionismo::class, 'visita_extensionismo', 'visita_extensionismo');
    }

    /** @return BelongsTo<EnfoquePoblacional, $this> */
    public function enfoquePoblacional(): BelongsTo
    {
        return $this->belongsTo(EnfoquePoblacional::class, 'enfoque_poblacional', 'enfoque_poblacional');
    }
}
