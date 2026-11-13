<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitaBorrador extends Model
{
    protected $table = 'visitas_borradores';

    protected $primaryKey = 'visita_borrador';

    protected $fillable = [
        'visita_extensionismo', 'nombres_productor', 'apellidos_productor', 'tipo_documento',
        'numero_documento', 'telefono_productor', 'sexo_productor', 'nombre_predio', 'divipola',
        'corregimiento', 'vereda', 'latitud', 'longitud',
    ];

    protected function casts(): array
    {
        return ['latitud' => 'decimal:7', 'longitud' => 'decimal:7'];
    }

    /** @return BelongsTo<VisitaExtensionismo, $this> */
    public function visitaExtensionismo(): BelongsTo
    {
        return $this->belongsTo(VisitaExtensionismo::class, 'visita_extensionismo', 'visita_extensionismo');
    }

    /** @return BelongsTo<Vereda, $this> */
    public function veredaRelacion(): BelongsTo
    {
        return $this->belongsTo(Vereda::class, 'vereda', 'vereda');
    }
}
