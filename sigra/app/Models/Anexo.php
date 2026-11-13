<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Anexo extends Model
{
    protected $table = 'anexos';

    protected $primaryKey = 'anexo';

    protected $fillable = ['archivo', 'entidad', 'registro', 'tipo_anexo'];

    /** @return BelongsTo<Archivo, $this> */
    public function archivo(): BelongsTo
    {
        return $this->belongsTo(Archivo::class, 'archivo', 'archivo');
    }
}
