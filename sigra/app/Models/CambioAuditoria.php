<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CambioAuditoria extends Model
{
    protected $table = 'cambios_auditoria';

    protected $primaryKey = 'cambio_auditoria';

    protected $fillable = ['version_auditoria', 'campo', 'valor_anterior', 'valor_nuevo'];

    /** @return BelongsTo<VersionAuditoria, $this> */
    public function versionAuditoria(): BelongsTo
    {
        return $this->belongsTo(VersionAuditoria::class, 'version_auditoria', 'version_auditoria');
    }
}
