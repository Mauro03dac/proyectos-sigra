import {
    camposTrazabilidad,
    type CambioTrazabilidad,
    type EstadoCompletoVisita,
    type VersionTrazabilidad,
} from '@/types/trazabilidad';

const etiquetaPorCampo = Object.fromEntries(
    camposTrazabilidad.map(({ clave, etiqueta }) => [clave, etiqueta]),
);

function crearCambio(
    campo: keyof EstadoCompletoVisita,
    anterior: string,
    nuevo: string,
): CambioTrazabilidad {
    return {
        campo,
        etiqueta: etiquetaPorCampo[campo],
        anterior,
        nuevo,
    };
}

const estadoInicialVisita0001: EstadoCompletoVisita = {
    nombrePredio: 'El Paraíso',
    vereda: 'Morichal',
    diagnostico:
        'El cultivo presenta afectaciones por plagas y requiere seguimiento técnico.',
    actividadesRealizadas:
        'Se realizó una visita de observación general y se revisaron las condiciones del cultivo.',
    recomendaciones: 'Realizar monitoreo semanal de las plantas.',
    compromisosProximaVisita:
        'Llevar registro fotográfico de la evolución del cultivo.',
};

const estadoSegundaVisita0001: EstadoCompletoVisita = {
    ...estadoInicialVisita0001,
    nombrePredio: 'El Porvenir',
    diagnostico:
        'El cultivo presenta afectaciones por plagas. Se identificaron áreas prioritarias para el manejo integrado y se establecieron recomendaciones de seguimiento técnico.',
    actividadesRealizadas:
        'Se realizó una revisión por lotes, se identificaron áreas prioritarias y se entregaron recomendaciones para el manejo integrado de plagas.',
};

const estadoTerceraVisita0001: EstadoCompletoVisita = {
    ...estadoSegundaVisita0001,
    vereda: 'La Esperanza',
    recomendaciones:
        'Mantener el monitoreo semanal, aplicar las medidas de manejo integrado recomendadas y registrar los resultados de cada intervención.',
    compromisosProximaVisita:
        'El productor llevará un registro fotográfico semanal y presentará los resultados del manejo integrado durante la próxima visita técnica.',
};

const estadoInicialVisita0002: EstadoCompletoVisita = {
    nombrePredio: 'La Ilusión',
    vereda: 'Tacarimena',
    diagnostico:
        'Se requiere fortalecer el seguimiento del cultivo y organizar las actividades de manejo del predio.',
    actividadesRealizadas: 'Se revisaron las condiciones generales del predio.',
    recomendaciones: 'Organizar un calendario de actividades del cultivo.',
    compromisosProximaVisita:
        'Preparar el calendario de actividades para revisarlo en la próxima visita.',
};

const estadoSegundaVisita0002: EstadoCompletoVisita = {
    ...estadoInicialVisita0002,
    diagnostico:
        'Se requiere fortalecer el seguimiento del cultivo. Se identificaron oportunidades de mejora en la organización del manejo y se definieron actividades prioritarias para el próximo ciclo.',
    actividadesRealizadas:
        'Se revisaron las condiciones generales del predio y se organizó con el productor un calendario inicial de actividades.',
};

const estadoTerceraVisita0002: EstadoCompletoVisita = {
    ...estadoSegundaVisita0002,
    nombrePredio: 'La Ilusión Productiva',
    compromisosProximaVisita:
        'El productor aplicará el calendario acordado, registrará las actividades realizadas y compartirá los avances durante la próxima visita.',
};

export const historialTrazabilidadPorVisita: Record<
    string,
    VersionTrazabilidad[]
> = {
    'VE-2026-0001': [
        {
            id: 'VE-2026-0001-v1',
            numero: 1,
            operacion: 'Registro inicial',
            usuario: 'Juan Rodríguez (demostración)',
            fechaHora: '09/11/2026 · 08:30',
            esDemostracion: true,
            estadoCompleto: estadoInicialVisita0001,
            cambios: [
                crearCambio(
                    'nombrePredio',
                    'Sin valor registrado',
                    estadoInicialVisita0001.nombrePredio,
                ),
                crearCambio(
                    'vereda',
                    'Sin valor registrado',
                    estadoInicialVisita0001.vereda,
                ),
                crearCambio(
                    'diagnostico',
                    'Sin valor registrado',
                    estadoInicialVisita0001.diagnostico,
                ),
                crearCambio(
                    'actividadesRealizadas',
                    'Sin valor registrado',
                    estadoInicialVisita0001.actividadesRealizadas,
                ),
                crearCambio(
                    'recomendaciones',
                    'Sin valor registrado',
                    estadoInicialVisita0001.recomendaciones,
                ),
                crearCambio(
                    'compromisosProximaVisita',
                    'Sin valor registrado',
                    estadoInicialVisita0001.compromisosProximaVisita,
                ),
            ],
        },
        {
            id: 'VE-2026-0001-v2',
            numero: 2,
            operacion: 'Primera corrección',
            usuario: 'Laura Méndez (demostración)',
            fechaHora: '10/11/2026 · 14:15',
            esDemostracion: true,
            estadoCompleto: estadoSegundaVisita0001,
            cambios: [
                crearCambio(
                    'nombrePredio',
                    estadoInicialVisita0001.nombrePredio,
                    estadoSegundaVisita0001.nombrePredio,
                ),
                crearCambio(
                    'diagnostico',
                    estadoInicialVisita0001.diagnostico,
                    estadoSegundaVisita0001.diagnostico,
                ),
                crearCambio(
                    'actividadesRealizadas',
                    estadoInicialVisita0001.actividadesRealizadas,
                    estadoSegundaVisita0001.actividadesRealizadas,
                ),
            ],
        },
        {
            id: 'VE-2026-0001-v3',
            numero: 3,
            operacion: 'Segunda corrección',
            usuario: 'Juan Rodríguez (demostración)',
            fechaHora: '11/11/2026 · 09:05',
            esDemostracion: true,
            estadoCompleto: estadoTerceraVisita0001,
            cambios: [
                crearCambio(
                    'vereda',
                    estadoSegundaVisita0001.vereda,
                    estadoTerceraVisita0001.vereda,
                ),
                crearCambio(
                    'recomendaciones',
                    estadoSegundaVisita0001.recomendaciones,
                    estadoTerceraVisita0001.recomendaciones,
                ),
                crearCambio(
                    'compromisosProximaVisita',
                    estadoSegundaVisita0001.compromisosProximaVisita,
                    estadoTerceraVisita0001.compromisosProximaVisita,
                ),
            ],
        },
    ],
    'VE-2026-0002': [
        {
            id: 'VE-2026-0002-v1',
            numero: 1,
            operacion: 'Registro inicial',
            usuario: 'Ana Martínez (demostración)',
            fechaHora: '10/11/2026 · 10:20',
            esDemostracion: true,
            estadoCompleto: estadoInicialVisita0002,
            cambios: [
                crearCambio(
                    'nombrePredio',
                    'Sin valor registrado',
                    estadoInicialVisita0002.nombrePredio,
                ),
                crearCambio(
                    'vereda',
                    'Sin valor registrado',
                    estadoInicialVisita0002.vereda,
                ),
                crearCambio(
                    'diagnostico',
                    'Sin valor registrado',
                    estadoInicialVisita0002.diagnostico,
                ),
                crearCambio(
                    'actividadesRealizadas',
                    'Sin valor registrado',
                    estadoInicialVisita0002.actividadesRealizadas,
                ),
                crearCambio(
                    'recomendaciones',
                    'Sin valor registrado',
                    estadoInicialVisita0002.recomendaciones,
                ),
                crearCambio(
                    'compromisosProximaVisita',
                    'Sin valor registrado',
                    estadoInicialVisita0002.compromisosProximaVisita,
                ),
            ],
        },
        {
            id: 'VE-2026-0002-v2',
            numero: 2,
            operacion: 'Primera corrección',
            usuario: 'Ana Martínez (demostración)',
            fechaHora: '11/11/2026 · 11:40',
            esDemostracion: true,
            estadoCompleto: estadoSegundaVisita0002,
            cambios: [
                crearCambio(
                    'diagnostico',
                    estadoInicialVisita0002.diagnostico,
                    estadoSegundaVisita0002.diagnostico,
                ),
                crearCambio(
                    'actividadesRealizadas',
                    estadoInicialVisita0002.actividadesRealizadas,
                    estadoSegundaVisita0002.actividadesRealizadas,
                ),
            ],
        },
        {
            id: 'VE-2026-0002-v3',
            numero: 3,
            operacion: 'Segunda corrección',
            usuario: 'Carlos Pérez (demostración)',
            fechaHora: '11/11/2026 · 16:10',
            esDemostracion: true,
            estadoCompleto: estadoTerceraVisita0002,
            cambios: [
                crearCambio(
                    'nombrePredio',
                    estadoSegundaVisita0002.nombrePredio,
                    estadoTerceraVisita0002.nombrePredio,
                ),
                crearCambio(
                    'compromisosProximaVisita',
                    estadoSegundaVisita0002.compromisosProximaVisita,
                    estadoTerceraVisita0002.compromisosProximaVisita,
                ),
            ],
        },
    ],
};
