<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VisitaExtensionismo extends Model
{
    protected $table = 'visitas_extensionismo';

    protected $primaryKey = 'visita_extensionismo';

    public const CREATED_AT = 'fecha_creacion';

    public const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = [
        'productor', 'predio', 'fecha_visita', 'estado', 'fecha_registro', 'linea_productiva_principal',
        'linea_productiva_secundaria', 'especie_productiva', 'numero_animales', 'area_hectareas',
        'tipo_discapacidad', 'victima_conflicto_armado', 'afiliado_sisben', 'puntaje_sisben',
        'afiliado_asociacion', 'nombre_asociacion', 'aspecto_visita', 'componente_visita', 'diagnostico',
        'actividades_realizadas', 'principales_proveedores', 'principales_compradores', 'fuentes_consulta',
        'recomendaciones', 'compromisos', 'usuario', 'nombre_extensionista',
        'numero_documento_extensionista', 'disciplina_extensionista', 'titulo_academico_extensionista',
        'nombres_productor_borrador', 'apellidos_productor_borrador', 'tipo_documento_borrador', 'numero_documento_borrador', 'telefono_productor_borrador', 'sexo_productor_borrador', 'nombre_predio_borrador', 'divipola_borrador', 'corregimiento_borrador', 'vereda_borrador', 'latitud_borrador', 'longitud_borrador',
    ];

    protected function casts(): array
    {
        return [
            'fecha_visita' => 'date', 'fecha_registro' => 'datetime', 'numero_animales' => 'integer',
            'area_hectareas' => 'decimal:2', 'victima_conflicto_armado' => 'boolean',
            'afiliado_sisben' => 'boolean', 'puntaje_sisben' => 'decimal:2',
            'afiliado_asociacion' => 'boolean', 'fecha_creacion' => 'datetime', 'fecha_actualizacion' => 'datetime',
            'latitud_borrador' => 'decimal:7', 'longitud_borrador' => 'decimal:7',
        ];
    }

    /** @return BelongsTo<Productor, $this> */
    public function productor(): BelongsTo
    {
        return $this->belongsTo(Productor::class, 'productor', 'productor');
    }

    /** @return BelongsTo<Predio, $this> */
    public function predio(): BelongsTo
    {
        return $this->belongsTo(Predio::class, 'predio', 'predio');
    }

    /** @return BelongsTo<LineaProductiva, $this> */
    public function lineaProductivaPrincipal(): BelongsTo
    {
        return $this->belongsTo(LineaProductiva::class, 'linea_productiva_principal', 'linea_productiva');
    }

    /** @return BelongsTo<LineaProductiva, $this> */
    public function lineaProductivaSecundaria(): BelongsTo
    {
        return $this->belongsTo(LineaProductiva::class, 'linea_productiva_secundaria', 'linea_productiva');
    }

    /** @return BelongsTo<EspecieProductiva, $this> */
    public function especieProductiva(): BelongsTo
    {
        return $this->belongsTo(EspecieProductiva::class, 'especie_productiva', 'especie_productiva');
    }

    /** @return BelongsTo<User, $this> */
    public function usuarioResponsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario', 'id');
    }

    /** @return BelongsToMany<EnfoquePoblacional, $this> */
    public function enfoquesPoblacionales(): BelongsToMany
    {
        return $this->belongsToMany(EnfoquePoblacional::class, 'visitas_enfoques_poblacionales', 'visita_extensionismo', 'enfoque_poblacional', 'visita_extensionismo', 'enfoque_poblacional')->withTimestamps('fecha_creacion', 'fecha_actualizacion');
    }

    /** @return HasMany<Anexo, $this> */
    public function anexos(): HasMany
    {
        return $this->hasMany(Anexo::class, 'registro', 'visita_extensionismo')->where('entidad', 'visita_extensionismo');
    }
}
