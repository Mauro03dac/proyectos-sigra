<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LineaProductiva extends Model
{
    protected $table = 'lineas_productivas';

    protected $primaryKey = 'linea_productiva';

    protected $fillable = ['codigo', 'nombre', 'descripcion', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }

    /** @return HasMany<EspecieProductiva, $this> */
    public function especiesProductivas(): HasMany
    {
        return $this->hasMany(EspecieProductiva::class, 'linea_productiva', 'linea_productiva');
    }

    /** @return HasMany<Cultivo, $this> */
    public function cultivos(): HasMany
    {
        return $this->hasMany(Cultivo::class, 'linea_productiva', 'linea_productiva');
    }
}
