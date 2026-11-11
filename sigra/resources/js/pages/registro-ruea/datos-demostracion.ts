export type EstadoRegistroRUEA = 'Completado' | 'Borrador';

export type RegistroRUEADemostracion = {
    numero: string;
    productor: string;
    extensionista: string;
    predio: string;
    vereda: string;
    fecha: string;
    fechaISO: string;
    estado: EstadoRegistroRUEA;
};

/** Registros locales para validar la presentación de la bandeja sin persistencia. */
export const registrosRUEADemostracion: RegistroRUEADemostracion[] = [
    {
        numero: 'RUEA-2026-0001',
        productor: 'Carlos Andrés Pérez',
        extensionista: 'Juan Rodríguez',
        predio: 'El Paraíso',
        vereda: 'Morichal',
        fecha: '09/11/2026',
        fechaISO: '2026-11-09',
        estado: 'Completado',
    },
    {
        numero: 'RUEA-2026-0002',
        productor: 'María Fernanda López',
        extensionista: 'Ana Martínez',
        predio: 'La Esperanza',
        vereda: 'Tacarimena',
        fecha: '10/11/2026',
        fechaISO: '2026-11-10',
        estado: 'Borrador',
    },
    {
        numero: 'RUEA-2026-0003',
        productor: 'Jorge Eliécer Gómez',
        extensionista: 'Juan Rodríguez',
        predio: 'El Recuerdo',
        vereda: 'Morichal',
        fecha: '10/11/2026',
        fechaISO: '2026-11-10',
        estado: 'Completado',
    },
    {
        numero: 'RUEA-2026-0004',
        productor: 'Luz Marina Cárdenas',
        extensionista: 'Ana Martínez',
        predio: 'La Primavera',
        vereda: 'El Caimán',
        fecha: '11/11/2026',
        fechaISO: '2026-11-11',
        estado: 'Completado',
    },
];
