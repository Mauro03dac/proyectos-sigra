<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cultivo extends Model
{
    protected $table = 'cultivos';

    protected $primaryKey = 'cultivo';

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
}
