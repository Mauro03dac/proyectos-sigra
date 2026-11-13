<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Productor extends Model
{
    protected $table = 'productores';

    protected $primaryKey = 'productor';

    protected $fillable = ['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'telefono', 'fecha_nacimiento', 'sexo'];

    protected function casts(): array
    {
        return ['fecha_nacimiento' => 'date'];
    }

    /** @return Attribute<string, never> */
    protected function nombreCompleto(): Attribute
    {
        return Attribute::get(fn (): string => trim("{$this->nombres} {$this->apellidos}"));
    }

    /** @return HasMany<Predio, $this> */
    public function predios(): HasMany
    {
        return $this->hasMany(Predio::class, 'productor', 'productor');
    }

    /** @return HasMany<VisitaExtensionismo, $this> */
    public function visitasExtensionismo(): HasMany
    {
        return $this->hasMany(VisitaExtensionismo::class, 'productor', 'productor');
    }
}
