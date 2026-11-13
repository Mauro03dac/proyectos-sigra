export type PreguntaRUEA = {
    id: string;
    texto: string;
};

export type SeccionRUEA = {
    id: string;
    numero: number;
    titulo: string;
    preguntas: readonly PreguntaRUEA[];
};

export const opcionesRespuesta = ['1', '2', '3', '4'] as const;

export const seccionesRUEA = [
    {
        id: 'capacidades-humanas-tecnicas',
        numero: 1,
        titulo: 'Desarrollo de capacidades humanas y técnicas',
        preguntas: [
            {
                id: 'S1_P01',
                texto: '¿Según su sistema productivo, con cuál de las siguientes opciones se identifica?',
            },
            {
                id: 'S1_P02',
                texto: '¿El productor presenta actividades productivas secundarias con qué enfoque o proyección?',
            },
            {
                id: 'S1_P03',
                texto: '¿Cómo es su acceso a tipo de herramientas y equipos para ser empleados en su proceso productivo?',
            },
            {
                id: 'S1_P04',
                texto: '¿Cuál es su estado actual con respecto a las BPA?',
            },
            {
                id: 'S1_P05',
                texto: '¿Cómo es la forma de comercialización del productor?',
            },
            {
                id: 'S1_P06',
                texto: '¿A qué tipo de mercado lleva su producto?',
            },
            {
                id: 'S1_P07',
                texto: '¿A qué nivel de valor agregado lleva su producto?',
            },
            {
                id: 'S1_P08',
                texto: '¿Gestiona registros de su sistema productivo?',
            },
            {
                id: 'S1_P09',
                texto: '¿Cómo es la vinculación de mano de obra?',
            },
            {
                id: 'S1_P10',
                texto: '¿Tiene acceso a créditos?',
            },
        ],
    },
    {
        id: 'capacidades-sociales-asociatividad',
        numero: 2,
        titulo: 'Desarrollo de capacidades sociales integrales y fortalecimiento de la asociatividad',
        preguntas: [
            {
                id: 'S2_P01',
                texto: '¿Está vinculado a algún tipo de organización?',
            },
            {
                id: 'S2_P02',
                texto: '¿Participa en actividades productivas de manera colectiva?',
            },
            {
                id: 'S2_P03',
                texto: '¿Participa el productor en procesos de emprendimiento y asociatividad?',
            },
            {
                id: 'S2_P04',
                texto: '¿Participa en alianzas comerciales?',
            },
            {
                id: 'S2_P05',
                texto: '¿Accede a apoyo técnico para el manejo de su sistema productivo?',
            },
            {
                id: 'S2_P06',
                texto: '¿Cuenta con sellos de calidad y certificaciones?',
            },
            {
                id: 'S2_P07',
                texto: '¿Qué conocimientos sobre propiedad intelectual posee?',
            },
        ],
    },
    {
        id: 'informacion-tic',
        numero: 3,
        titulo: 'Acceso a la información y uso de las TIC',
        preguntas: [
            {
                id: 'S3_P01',
                texto: '¿Qué acceso tiene a fuentes de información relacionadas con su sistema productivo?',
            },
            {
                id: 'S3_P02',
                texto: '¿Qué acceso tiene a las TIC?',
            },
            {
                id: 'S3_P03',
                texto: '¿Qué tanto utiliza las TIC para toma de decisiones?',
            },
            {
                id: 'S3_P04',
                texto: 'Para el manejo del agronegocio, ¿qué habilidades y competencias tiene en el uso de las TIC?',
            },
            {
                id: 'S3_P05',
                texto: '¿Cómo es el nivel de apropiación social del conocimiento tradicional y científico?',
            },
        ],
    },
    {
        id: 'recursos-naturales',
        numero: 4,
        titulo: 'Gestión sostenible de los recursos naturales',
        preguntas: [
            {
                id: 'S4_P01',
                texto: '¿Conoce y planifica en su sistema productivo, actividades de conservación de la biodiversidad y el medio ambiente?',
            },
            {
                id: 'S4_P02',
                texto: '¿Conoce y planifica actividades de conservación del recurso hídrico en su sistema productivo?',
            },
            {
                id: 'S4_P03',
                texto: '¿Tiene conocimiento e implementa acciones de prevención y/o recuperación del medio ambiente enfocado en la mitigación y adaptación al cambio climático?',
            },
            {
                id: 'S4_P04',
                texto: '¿Conoce la normatividad ambiental?',
            },
        ],
    },
    {
        id: 'habilidades-participacion',
        numero: 5,
        titulo: 'Desarrollo de habilidades para la participación',
        preguntas: [
            {
                id: 'S5_P01',
                texto: '¿Tiene conocimiento sobre instancias y mecanismos de participación?',
            },
            {
                id: 'S5_P02',
                texto: '¿Tiene conocimiento sobre herramientas para la participación?',
            },
            {
                id: 'S5_P03',
                texto: '¿Conoce los mecanismos de control político y social? ¿Y ha participado en los mismos?',
            },
            {
                id: 'S5_P04',
                texto: '¿Cuál ha sido el rol del productor en la autogestión de las comunidades?',
            },
        ],
    },
] as const satisfies readonly SeccionRUEA[];

export const totalPreguntasRUEA = seccionesRUEA.reduce(
    (total, seccion) => total + seccion.preguntas.length,
    0,
);
