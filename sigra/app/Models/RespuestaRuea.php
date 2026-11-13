<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RespuestaRuea extends Model
{
    public $timestamps = false;

    protected $table = 'respuestas_ruea';

    protected $primaryKey = 'respuesta_ruea';

    protected $fillable = ['registro_ruea', 'campo', 'valor'];

    protected function casts(): array
    {
        return ['valor' => 'integer'];
    }

    /** @return BelongsTo<RegistroRuea, $this> */
    public function registro(): BelongsTo
    {
        return $this->belongsTo(RegistroRuea::class, 'registro_ruea', 'registro_ruea');
    }
}
