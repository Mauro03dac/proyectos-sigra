export type ProductorDirectorioDemostracion = {
    id: string;
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    fechaNacimiento: string;
    fechaNacimientoISO: string;
};

/** Registros ficticios para validar el Directorio mientras no existe persistencia. */
export const productoresDirectorioDemostracion: ProductorDirectorioDemostracion[] =
    [
        {
            id: 'productor-demo-001',
            nombreCompleto: 'Marlene Rodríguez Pinto',
            tipoDocumento: 'Cédula de ciudadanía',
            numeroDocumento: '999000001',
            telefono: '300 000 0001',
            fechaNacimiento: '14/03/1978',
            fechaNacimientoISO: '1978-03-14',
        },
        {
            id: 'productor-demo-002',
            nombreCompleto: 'Carlos Mauricio Ávila',
            tipoDocumento: 'Cédula de ciudadanía',
            numeroDocumento: '999000002',
            telefono: '300 000 0002',
            fechaNacimiento: '22/07/1983',
            fechaNacimientoISO: '1983-07-22',
        },
        {
            id: 'productor-demo-003',
            nombreCompleto: 'Lucía Fernanda Cárdenas',
            tipoDocumento: 'Cédula de ciudadanía',
            numeroDocumento: '999000003',
            telefono: '300 000 0003',
            fechaNacimiento: '09/11/1988',
            fechaNacimientoISO: '1988-11-09',
        },
        {
            id: 'productor-demo-004',
            nombreCompleto: 'Julián Andrés Morales',
            tipoDocumento: 'Cédula de ciudadanía',
            numeroDocumento: '999000004',
            telefono: '300 000 0004',
            fechaNacimiento: '31/01/1975',
            fechaNacimientoISO: '1975-01-31',
        },
    ];
