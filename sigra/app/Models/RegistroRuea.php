<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistroRuea extends Model
{
    protected $table = 'registros_ruea';

    protected $primaryKey = 'registro_ruea';

    protected $fillable = [
        'productor', 'predio', 'usuario', 'fecha_registro', 'estado', 'observaciones',
        'nombre_extensionista', 'numero_documento_extensionista', 'perfil_extensionista',
        'fecha_finalizacion',
    ];

    protected function casts(): array
    {
        return ['fecha_registro' => 'date', 'fecha_finalizacion' => 'datetime'];
    }

    /** @return BelongsTo<Productor, $this> */
    public function productorRelacionado(): BelongsTo
    {
        return $this->belongsTo(Productor::class, 'productor', 'productor');
    }

    /** @return BelongsTo<Predio, $this> */
    public function predioRelacionado(): BelongsTo
    {
        return $this->belongsTo(Predio::class, 'predio', 'predio');
    }

    /** @return BelongsTo<User, $this> */
    public function usuarioResponsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario', 'id');
    }

    /** @return HasMany<RespuestaRuea, $this> */
    public function respuestas(): HasMany
    {
        return $this->hasMany(RespuestaRuea::class, 'registro_ruea', 'registro_ruea');
    }
}
