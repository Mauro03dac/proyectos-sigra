export const tiposPoblacionDiferencial = [
    'Raizal',
    'Discapacitado',
    'Comunidad negra',
    'Comunidad LGTBI',
    'Palenquero',
    'Afrodescendiente',
    'Madre cabeza de hogar',
    'Indígena',
    'Víctima',
    'Gitano',
    'Adulto mayor',
    'Adolescente',
] as const;

export const tiposExplotacion = [
    'Cría',
    'Levante',
    'Ceba',
    'Doble propósito',
    'Lechería',
] as const;

export const sistemasProduccionBovina = [
    'Intensivo',
    'Semi-intensivo',
    'Extensivo',
] as const;

export const razasBovinas = [
    'Brahmán blanco',
    'Guzerá',
    'Nelore',
    'Gyr',
    'Brahmán rojo',
    'Simmental',
    'Romosinuano',
    'Holstein',
    'Pardo suizo',
    'Jersey',
    'Girolando',
    'Normando',
    'Charolais',
    'Limousin',
    'Hereford',
    'Angus',
    'Otras',
] as const;

export const tiposComercializacionBovina = [
    'Leche',
    'Carne',
    'Leche y carne',
    'Subproductos',
] as const;

export const destinosProduccion = [
    'Veredal',
    'Municipal',
    'Departamental',
    'Nacional',
] as const;

export const instalaciones = [
    'Bodega',
    'Establo',
    'Corral',
    'Bascula',
    'Manga',
    'Embarcadero',
    'Embudo',
    'Brete',
    'Sala de ordeño',
    'Sala de beneficio agrícola',
    'Secaderos',
    'Hangar maquinaria',
    'Salón almacenamiento de producto',
    'Cuarto frio',
    'Vivienda',
] as const;

export type CultivoInventario = {
    id: string;
    label: string;
    grupo?: string;
};

export const cultivosInventario = [
    { id: 'cafe', label: 'Café' },
    { id: 'cacao', label: 'Cacao' },
    { id: 'platano', label: 'Plátano' },
    { id: 'maiz', label: 'Maíz' },
    { id: 'sorgo', label: 'Sorgo' },
    { id: 'arroz', label: 'Arroz' },
    { id: 'yuca', label: 'Yuca' },
    { id: 'cana', label: 'Caña' },
    { id: 'palma-aceite', label: 'Palma de aceite' },
    { id: 'mango', label: 'Mango', grupo: 'Ref. comercial · Frutales' },
    { id: 'maracuya', label: 'Maracuyá' },
    { id: 'papaya', label: 'Papaya' },
    { id: 'guayaba', label: 'Guayaba' },
    { id: 'guanabana', label: 'Guanábana' },
    { id: 'aguacate', label: 'Aguacate' },
    { id: 'banano', label: 'Banano' },
    { id: 'patilla', label: 'Patilla' },
    { id: 'zapote', label: 'Zapote' },
    { id: 'mamoncillo', label: 'Mamoncillo' },
    { id: 'limon', label: 'Limón', grupo: 'Cítricos' },
    { id: 'lima', label: 'Lima' },
    { id: 'naranja', label: 'Naranja' },
    { id: 'mandarina', label: 'Mandarina' },
    { id: 'pina', label: 'Piña' },
    { id: 'otros', label: 'Otros' },
] satisfies readonly CultivoInventario[];

export const edadesGanaderas = [
    'Hembras menores de 1 año',
    'Hembras de 1 a 2 años',
    'Hembras de 2 a 3 años',
    'Hembras > de 3 años',
    'Machos < de 1 año',
    'Machos de 1 a 2 años',
    'Machos de 2 a 3 años',
    'Machos > de 3 años',
] as const;

export const especiesPiscicolas = [
    'Cachama',
    'Mojarra',
    'Yamú',
    'Bagre',
    'Bocachico',
] as const;

export const especiesAvicolas = [
    'Gallina ponedora',
    'Gallina criolla',
    'Pollo de engorde',
    'Pato',
    'Otra',
    '1.',
    '2.',
    '3.',
    '4.',
] as const;

export const razasPorcinas = [
    'Hampshire',
    'Duroc',
    'Pietrain',
    'Landrace',
    'Casco de mula',
    'Yorkshire',
    'Otra; ¿Cuál?',
] as const;

export const etapasProduccionPorcina = [
    'Cría',
    'Levante',
    'Ceba',
    'Ciclo completo',
] as const;

export const razasOvinas = [
    'Katahdin',
    'Santa Inés',
    'Dorper',
    'Pelibuey',
    'Charollais',
    'Otra; ¿Cuál?',
] as const;

export const actividadesPostcosecha = [
    'Limpieza',
    'Selección',
    'Clasificación',
    'Despulpado',
    'Secado',
    'Encerado',
    'Otro',
] as const;

export const opcionesSiNo = ['Sí', 'No'] as const;

export const opcionesTipoCerca = [
    'Eléctrica',
    'Alambre de púa',
    'Viva',
] as const;

export const opcionesTopografia = ['Plana', 'Ondulada', 'Montañosa'] as const;
