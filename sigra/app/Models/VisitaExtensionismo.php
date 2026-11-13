<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VisitaExtensionismo extends Model
{
    protected $table = 'visitas_extensionismo';

    protected $primaryKey = 'visita_extensionismo';

    protected $fillable = [
        'productor', 'predio', 'fecha_visita', 'estado', 'fecha_registro', 'linea_productiva_principal',
        'linea_productiva_secundaria', 'especie_productiva', 'linea_productiva_principal_otra',
        'especie_productiva_otra', 'linea_productiva_secundaria_otra', 'numero_animales', 'area_hectareas', 'unidad_area_ingresada',
        'tipo_discapacidad', 'victima_conflicto_armado', 'afiliado_sisben', 'puntaje_sisben',
        'afiliado_asociacion', 'nombre_asociacion', 'aspecto_visita', 'componente_visita', 'diagnostico',
        'actividades_realizadas', 'principales_proveedores', 'principales_compradores', 'fuentes_consulta',
        'recomendaciones', 'compromisos', 'usuario', 'nombre_extensionista',
        'numero_documento_extensionista', 'disciplina_extensionista', 'titulo_academico_extensionista',
    ];

    protected function casts(): array
    {
        return [
            'fecha_visita' => 'date', 'fecha_registro' => 'datetime', 'numero_animales' => 'integer',
            'area_hectareas' => 'decimal:6', 'puntaje_sisben' => 'decimal:2',
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
        return $this->belongsToMany(EnfoquePoblacional::class, 'visitas_enfoques_poblacionales', 'visita_extensionismo', 'enfoque_poblacional', 'visita_extensionismo', 'enfoque_poblacional')->withTimestamps();
    }

    /** @return HasMany<Anexo, $this> */
    public function anexos(): HasMany
    {
        return $this->hasMany(Anexo::class, 'registro', 'visita_extensionismo')->where('entidad', 'visita_extensionismo');
    }

    /** @return HasOne<VisitaBorrador, $this> */
    public function borrador(): HasOne
    {
        return $this->hasOne(VisitaBorrador::class, 'visita_extensionismo', 'visita_extensionismo');
    }
}
