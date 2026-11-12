<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VersionAuditoria extends Model
{
    protected $table = 'versiones_auditoria';

    protected $primaryKey = 'version_auditoria';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = null;

    protected $fillable = ['entidad', 'registro', 'numero_version', 'accion', 'usuario'];

    protected function casts(): array
    {
        return ['numero_version' => 'integer', 'fecha_creacion' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function usuarioResponsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario', 'id');
    }

    /** @return HasMany<CambioAuditoria, $this> */
    public function cambios(): HasMany
    {
        return $this->hasMany(CambioAuditoria::class, 'version_auditoria', 'version_auditoria');
    }
}
