<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cultivo extends Model
{
    protected $table = 'cultivos';

    protected $primaryKey = 'cultivo';

    protected $fillable = ['linea_productiva', 'codigo', 'nombre', 'grupo', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }

    /** @return BelongsTo<LineaProductiva, $this> */
    public function lineaProductiva(): BelongsTo
    {
        return $this->belongsTo(LineaProductiva::class, 'linea_productiva', 'linea_productiva');
    }
}
