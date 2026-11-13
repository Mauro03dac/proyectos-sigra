export const camposTrazabilidad = [
    { clave: 'nombrePredio', etiqueta: 'Nombre del predio' },
    { clave: 'vereda', etiqueta: 'Vereda' },
    { clave: 'diagnostico', etiqueta: 'Diagnóstico' },
    { clave: 'actividadesRealizadas', etiqueta: 'Actividades realizadas' },
    { clave: 'recomendaciones', etiqueta: 'Recomendaciones' },
    {
        clave: 'compromisosProximaVisita',
        etiqueta: 'Compromisos para la próxima visita',
    },
] as const;

export type CampoTrazabilidad = string;

export type EstadoCompletoVisita = Record<CampoTrazabilidad, string>;

export type RegistroTrazabilidad = {
    entidad: 'visita_extensionismo' | 'productor';
    etiquetaEntidad: 'Visita' | 'Productor';
    numero: string;
    productor: string;
    extensionista: string;
    fecha: string;
    vereda: string;
    estado: string;
    estadoReal?: string;
};

export type VisitaTrazabilidad = RegistroTrazabilidad;

export type CambioTrazabilidad = {
    campo: CampoTrazabilidad;
    etiqueta: string;
    anterior: string;
    nuevo: string;
};

export type VersionTrazabilidad = {
    id: string;
    numero: number;
    operacion: string;
    usuario: string;
    fechaHora: string;
    estadoCompleto?: EstadoCompletoVisita;
    cambios: CambioTrazabilidad[];
};
