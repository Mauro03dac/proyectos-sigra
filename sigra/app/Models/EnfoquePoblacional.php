<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EnfoquePoblacional extends Model
{
    protected $table = 'enfoques_poblacionales';

    protected $primaryKey = 'enfoque_poblacional';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = ['codigo', 'nombre', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime'];
    }

    /** @return BelongsToMany<VisitaExtensionismo, $this> */
    public function visitasExtensionismo(): BelongsToMany
    {
        return $this->belongsToMany(VisitaExtensionismo::class, 'visitas_enfoques_poblacionales', 'enfoque_poblacional', 'visita_extensionismo', 'enfoque_poblacional', 'visita_extensionismo');
    }
}
