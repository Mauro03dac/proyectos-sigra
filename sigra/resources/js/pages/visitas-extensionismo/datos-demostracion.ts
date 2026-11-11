export type VisitaDemostracion = {
    numero: string;
    productor: string;
    extensionista: string;
    fecha: string;
    vereda: string;
    estado: 'Completada' | 'Borrador';
};

export const visitasDemostracion: VisitaDemostracion[] = [
    {
        numero: 'VE-2026-0001',
        productor: 'Carlos Andrés Pérez',
        extensionista: 'Juan Rodríguez',
        fecha: '09/11/2026',
        vereda: 'Morichal',
        estado: 'Completada',
    },
    {
        numero: 'VE-2026-0002',
        productor: 'María Fernanda López',
        extensionista: 'Ana Martínez',
        fecha: '10/11/2026',
        vereda: 'Tacarimena',
        estado: 'Borrador',
    },
];
