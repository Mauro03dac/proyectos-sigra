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

export type CampoTrazabilidad = (typeof camposTrazabilidad)[number]['clave'];

export type EstadoCompletoVisita = Record<CampoTrazabilidad, string>;

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
    esDemostracion: true;
    estadoCompleto: EstadoCompletoVisita;
    cambios: CambioTrazabilidad[];
};
