<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Anexo extends Model
{
    protected $table = 'anexos';

    protected $primaryKey = 'anexo';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = null;

    protected $fillable = ['archivo', 'entidad', 'registro', 'tipo_anexo'];

    protected function casts(): array
    {
        return ['fecha_creacion' => 'datetime'];
    }

    /** @return BelongsTo<Archivo, $this> */
    public function archivo(): BelongsTo
    {
        return $this->belongsTo(Archivo::class, 'archivo', 'archivo');
    }
}
