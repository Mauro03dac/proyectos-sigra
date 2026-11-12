<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CambioAuditoria extends Model
{
    protected $table = 'cambios_auditoria';

    protected $primaryKey = 'cambio_auditoria';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = null;

    protected $fillable = ['version_auditoria', 'campo', 'valor_anterior', 'valor_nuevo'];

    protected function casts(): array
    {
        return ['fecha_creacion' => 'datetime'];
    }

    /** @return BelongsTo<VersionAuditoria, $this> */
    public function versionAuditoria(): BelongsTo
    {
        return $this->belongsTo(VersionAuditoria::class, 'version_auditoria', 'version_auditoria');
    }
}
