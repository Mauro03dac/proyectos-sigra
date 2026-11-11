export type RegistroProductorDemostracion = {
    numero: string;
    productor: string;
    extensionista: string;
    predio: string;
    vereda: string;
    fecha: string;
    fechaISO: string;
};

/** Registros locales para validar la bandeja mientras no existe persistencia. */
export const registrosProductorDemostracion: RegistroProductorDemostracion[] = [
    {
        numero: 'PRD-2026-0001',
        productor: 'Carlos Andrés Pérez',
        extensionista: 'Juan Rodríguez',
        predio: 'El Paraíso',
        vereda: 'Morichal',
        fecha: '09/11/2026',
        fechaISO: '2026-11-09',
    },
    {
        numero: 'PRD-2026-0002',
        productor: 'María Fernanda López',
        extensionista: 'Ana Martínez',
        predio: 'La Esperanza',
        vereda: 'Tacarimena',
        fecha: '10/11/2026',
        fechaISO: '2026-11-10',
    },
    {
        numero: 'PRD-2026-0003',
        productor: 'Jorge Eliécer Gómez',
        extensionista: 'Juan Rodríguez',
        predio: 'El Recuerdo',
        vereda: 'Morichal',
        fecha: '10/11/2026',
        fechaISO: '2026-11-10',
    },
    {
        numero: 'PRD-2026-0004',
        productor: 'Luz Marina Cárdenas',
        extensionista: 'Ana Martínez',
        predio: 'La Primavera',
        vereda: 'El Caimán',
        fecha: '11/11/2026',
        fechaISO: '2026-11-11',
    },
];
