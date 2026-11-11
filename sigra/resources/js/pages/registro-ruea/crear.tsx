import { Head } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { useId, useState } from 'react';
import {
    AlertCircle,
    CalendarDays,
    FileText,
    Hash,
    Landmark,
    Leaf,
    MapPin,
    Navigation,
    Phone,
    Ruler,
    Save,
    Sprout,
    UserRound,
    UsersRound,
    Wifi,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FormularioHeader } from '@/components/formulario-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { crear as crearRUEARoute, index } from '@/routes/registro-ruea';
import {
    opcionesRespuesta,
    seccionesRUEA,
    totalPreguntasRUEA,
} from './datos-formulario';

type DatosGenerales = {
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    fechaNacimiento: string;
    sexo: string;
    departamento: string;
    municipio: string;
    corregimiento: string;
    vereda: string;
    nombrePredio: string;
    longitud: string;
    latitud: string;
    actividadProductiva: string;
    hectareas: string;
};

const datosGeneralesIniciales: DatosGenerales = {
    nombreCompleto: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    fechaNacimiento: '',
    sexo: '',
    departamento: '',
    municipio: '',
    corregimiento: '',
    vereda: '',
    nombrePredio: '',
    longitud: '',
    latitud: '',
    actividadProductiva: '',
    hectareas: '',
};

type CampoTextoProps = {
    etiqueta: string;
    valor: string;
    tipo?: 'text' | 'tel' | 'date' | 'number';
    icono?: LucideIcon;
    placeholder?: string;
    onChange: (valor: string) => void;
};

type CampoSeleccionProps = {
    etiqueta: string;
    valor: string;
    onChange: (valor: string) => void;
};

type TonoSeccion = 'green' | 'blue' | 'leaf' | 'coral' | 'yellow';

const estilosTono: Record<TonoSeccion, string> = {
    green: 'bg-[#17803D] text-white shadow-[0_4px_0_#0E3B2A]',
    blue: 'bg-[#1B86B5] text-white shadow-[0_4px_0_#12668A]',
    leaf: 'bg-[#4E9A2B] text-white shadow-[0_4px_0_#34721D]',
    coral: 'bg-[#E0573F] text-white shadow-[0_4px_0_#A93426]',
    yellow: 'bg-[#FFC933] text-[#3A2A00] shadow-[0_4px_0_#B78A0E]',
};

const iconosSeccion: Record<string, LucideIcon> = {
    'capacidades-humanas-tecnicas': Sprout,
    'capacidades-sociales-asociatividad': UsersRound,
    'informacion-tic': Wifi,
    'recursos-naturales': Leaf,
    'habilidades-participacion': Landmark,
};

const tonosSeccion: TonoSeccion[] = [
    'green',
    'blue',
    'coral',
    'leaf',
    'yellow',
];

function CampoTexto({
    etiqueta,
    valor,
    tipo = 'text',
    icono: Icon,
    placeholder,
    onChange,
}: CampoTextoProps) {
    const campoId = `ruea-${useId().replace(/:/g, '')}`;

    return (
        <label htmlFor={campoId} className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-[#10281D] dark:text-[#E5F3E8]">
                {etiqueta}
            </span>
            <span className="relative block">
                {Icon && (
                    <Icon className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-[#2F6A45] dark:text-[#9DCEA8]" />
                )}
                <Input
                    id={campoId}
                    name={campoId}
                    type={tipo}
                    value={valor}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className={cn(
                        'h-12 rounded-2xl border-[1.5px] border-[#6F9479] bg-[#F7FBF4] text-[15px] text-[#10281D] shadow-none placeholder:text-[#607665] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus-visible:bg-[#294330]',
                        Icon && 'pl-12',
                    )}
                />
            </span>
        </label>
    );
}

function CampoSeleccion({ etiqueta, valor, onChange }: CampoSeleccionProps) {
    const campoId = `ruea-${useId().replace(/:/g, '')}`;

    return (
        <label htmlFor={campoId} className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-[#10281D] dark:text-[#E5F3E8]">
                {etiqueta}
            </span>
            <select
                id={campoId}
                name={campoId}
                value={valor}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 w-full rounded-2xl border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-4 text-[15px] text-[#10281D] transition outline-none hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:focus:bg-[#294330]"
            >
                <option value="">Catálogo pendiente de integración</option>
            </select>
        </label>
    );
}

function CampoMultilinea({
    valor,
    onChange,
}: {
    valor: string;
    onChange: (valor: string) => void;
}) {
    const campoId = `ruea-${useId().replace(/:/g, '')}`;

    return (
        <textarea
            id={campoId}
            name={campoId}
            aria-label="Observaciones del registro"
            value={valor}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Escriba las observaciones del registro"
            rows={5}
            className="block min-h-[150px] w-full resize-y rounded-2xl border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-4 py-3 text-[15px] leading-6 text-[#10281D] outline-none placeholder:text-[#607665] hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus:bg-[#294330]"
        />
    );
}

function GrupoDatosGenerales({
    titulo,
    descripcion,
    icono: Icon,
    children,
}: {
    titulo: string;
    descripcion?: string;
    icono: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[22px] border-[1.5px] border-[#D1E0CB] bg-[#F7FBF4] p-5 dark:border-[#3E5B46] dark:bg-[#22352A]">
            <div className="mb-5 flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E3] text-[#17803D] dark:bg-[#294330] dark:text-[#A9D8AF]">
                    <Icon className="size-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                    <h3 className="text-[17px] font-extrabold text-[#103F2D] dark:text-[#F0FFF3]">
                        {titulo}
                    </h3>
                    {descripcion && (
                        <p className="mt-0.5 text-sm text-[#607665] dark:text-[#BFD9C5]">
                            {descripcion}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}

function TarjetaSeccion({
    numero,
    titulo,
    total,
    icono: Icon,
    tono,
    children,
}: {
    numero: number;
    titulo: string;
    total: number;
    icono: LucideIcon;
    tono: TonoSeccion;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]">
            <div className="mb-6 flex items-start gap-4 border-b-2 border-dashed border-[#B5CAAE] pb-5 dark:border-[#3E5B46]">
                <span
                    className={cn(
                        'flex size-14 shrink-0 items-center justify-center rounded-2xl',
                        estilosTono[tono],
                    )}
                >
                    <Icon className="size-7" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#3E5547] dark:text-[#BFD9C5]">
                        Sección {numero} · {total} preguntas
                    </p>
                    <h2 className="mt-1 text-xl leading-tight font-extrabold tracking-[-0.02em] text-[#10281D] sm:text-[22px] dark:text-[#F0FFF3]">
                        {titulo}
                    </h2>
                </div>
            </div>
            {children}
        </section>
    );
}

function PreguntaRUEA({
    numero,
    texto,
    respuesta,
    onChange,
}: {
    numero: number;
    texto: string;
    respuesta?: string;
    onChange: (respuesta: string) => void;
}) {
    return (
        <fieldset className="min-w-0 rounded-2xl border-[1.5px] border-[#B5CAAE] bg-[#FBFDF9] p-4 sm:p-5 dark:border-[#3E5B46] dark:bg-[#22352A]">
            <legend className="sr-only">
                Pregunta {numero}: {texto}
            </legend>
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0E3B2A] text-sm font-extrabold text-white dark:bg-[#4E9A2B]">
                    {numero}
                </span>
                <p className="min-w-0 text-[15px] leading-6 font-bold text-[#10281D] dark:text-[#F0FFF3]">
                    {texto}
                </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {opcionesRespuesta.map((opcion) => {
                    const id = `respuesta-${numero}-${opcion}`;
                    const seleccionada = respuesta === opcion;

                    return (
                        <label
                            key={opcion}
                            htmlFor={id}
                            className={cn(
                                'flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-[#6F9479] bg-white text-lg font-extrabold text-[#10281D] transition focus-within:ring-[4px] focus-within:ring-[#4E9A2B]/30 hover:border-[#17803D] hover:bg-[#EEF6EA] dark:border-[#5E8068] dark:bg-[#1B2A21] dark:text-[#F0FFF3] dark:hover:bg-[#2C4933]',
                                seleccionada &&
                                    'border-[#17803D] bg-[#17803D] text-white shadow-[0_3px_0_#0E3B2A] hover:bg-[#126B32] dark:border-[#65B874] dark:bg-[#17803D] dark:text-white dark:hover:bg-[#126B32]',
                            )}
                        >
                            <input
                                id={id}
                                type="radio"
                                name={`pregunta-${numero}`}
                                value={opcion}
                                checked={seleccionada}
                                onChange={() => onChange(opcion)}
                                className="sr-only"
                            />
                            {opcion}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

function BloqueFirma({ titulo, campos }: { titulo: string; campos: string[] }) {
    const bloqueId = `firma-${useId().replace(/:/g, '')}`;

    return (
        <section className="rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-white p-5 sm:p-6 dark:border-[#3E5B46] dark:bg-[#1B2A21]">
            <h3 className="text-lg font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                {titulo}
            </h3>
            <div className="mt-4 grid gap-4">
                {campos.map((campo) => (
                    <div key={campo}>
                        <Label
                            htmlFor={
                                campo === 'Firma'
                                    ? undefined
                                    : `${bloqueId}-${campo}`
                            }
                            className="mb-2 block text-sm font-bold text-[#10281D] dark:text-[#E5F3E8]"
                        >
                            {campo}
                        </Label>
                        {campo === 'Firma' ? (
                            <div
                                aria-label={`${campo}: espacio para firma`}
                                role="group"
                                className="flex min-h-28 items-center justify-center rounded-2xl border-2 border-dashed border-[#6F9479] bg-[#F7FBF4] text-center text-sm text-[#607665] dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#BFD9C5]"
                            >
                                Espacio para firma
                                <span className="sr-only">
                                    La firma aún no ha sido registrada
                                </span>
                            </div>
                        ) : (
                            <Input
                                id={`${bloqueId}-${campo}`}
                                name={`${bloqueId}-${campo}`}
                                placeholder={`Ingrese ${campo.toLocaleLowerCase('es')}`}
                                className="h-12 rounded-2xl border-[1.5px] border-[#6F9479] bg-[#F7FBF4] text-[#10281D] dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3]"
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function CrearRUEA() {
    const [datosGenerales, setDatosGenerales] = useState<DatosGenerales>(
        datosGeneralesIniciales,
    );
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});
    const [observaciones, setObservaciones] = useState('');
    const [avisoGuardado, setAvisoGuardado] = useState('');

    const actualizarDato = (campo: keyof DatosGenerales, valor: string) => {
        setDatosGenerales((datosActuales) => ({
            ...datosActuales,
            [campo]: valor,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAvisoGuardado(
            'El guardado del registro RUEA estará disponible cuando se integre la persistencia con PostgreSQL.',
        );
    };

    const handleGuardarBorrador = () => {
        setAvisoGuardado(
            'Guardar borrador estará disponible cuando se integre la persistencia con Laravel y PostgreSQL.',
        );
    };

    return (
        <>
            <Head title="Registro RUEA" />
            <main
                className="sigra-jakarta sigra-pulido min-w-0 flex-1 bg-[#DCE8D2] px-4 py-5 pb-8 sm:px-8 sm:py-[26px] sm:pb-11 xl:px-10 dark:bg-[#14221A]"
                style={{
                    backgroundImage:
                        'radial-gradient(#B9CFB0 1.5px, transparent 1.7px)',
                    backgroundSize: '24px 24px',
                }}
            >
                <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
                    <FormularioHeader
                        title="FORMATO REGISTRO DE USUARIOS DE EXTENSIÓN AGROPECUARIA -RUEA-"
                        description="Registra la información de los usuarios de extensión agropecuaria."
                        badges={[{ label: 'Nuevo registro', tone: 'accent' }]}
                    />

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6"
                    >
                        <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                            <div className="mb-6 flex items-start gap-4 border-b-2 border-dashed border-[#B5CAAE] pb-5 dark:border-[#3E5B46]">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#17803D] text-white shadow-[0_4px_0_#0E3B2A]">
                                    <UserRound className="size-7" />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-[#3E5547] dark:text-[#BFD9C5]">
                                        Información principal
                                    </p>
                                    <h2 className="mt-1 text-xl font-extrabold text-[#10281D] sm:text-[22px] dark:text-[#F0FFF3]">
                                        Datos generales del usuario
                                    </h2>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <GrupoDatosGenerales
                                    titulo="Identificación"
                                    icono={FileText}
                                >
                                    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr]">
                                        <CampoTexto
                                            etiqueta="Nombre completo"
                                            valor={
                                                datosGenerales.nombreCompleto
                                            }
                                            icono={UserRound}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'nombreCompleto',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoSeleccion
                                            etiqueta="Tipo de documento"
                                            valor={datosGenerales.tipoDocumento}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'tipoDocumento',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Número de documento"
                                            valor={
                                                datosGenerales.numeroDocumento
                                            }
                                            icono={FileText}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'numeroDocumento',
                                                    valor,
                                                )
                                            }
                                        />
                                    </div>
                                </GrupoDatosGenerales>

                                <GrupoDatosGenerales
                                    titulo="Datos personales y contacto"
                                    icono={Phone}
                                >
                                    <div className="grid gap-5 lg:grid-cols-3">
                                        <CampoTexto
                                            etiqueta="Fecha de nacimiento"
                                            tipo="date"
                                            valor={
                                                datosGenerales.fechaNacimiento
                                            }
                                            icono={CalendarDays}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'fechaNacimiento',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoSeleccion
                                            etiqueta="Sexo"
                                            valor={datosGenerales.sexo}
                                            onChange={(valor) =>
                                                actualizarDato('sexo', valor)
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Número de teléfono"
                                            tipo="tel"
                                            valor={datosGenerales.telefono}
                                            icono={Phone}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'telefono',
                                                    valor,
                                                )
                                            }
                                        />
                                    </div>
                                </GrupoDatosGenerales>

                                <GrupoDatosGenerales
                                    titulo="Ubicación del predio"
                                    icono={MapPin}
                                >
                                    <div className="grid gap-5 lg:grid-cols-4">
                                        <CampoSeleccion
                                            etiqueta="Departamento"
                                            valor={datosGenerales.departamento}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'departamento',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoSeleccion
                                            etiqueta="Municipio"
                                            valor={datosGenerales.municipio}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'municipio',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Corregimiento"
                                            valor={datosGenerales.corregimiento}
                                            icono={MapPin}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'corregimiento',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Vereda"
                                            valor={datosGenerales.vereda}
                                            icono={MapPin}
                                            onChange={(valor) =>
                                                actualizarDato('vereda', valor)
                                            }
                                        />
                                        <div className="lg:col-span-4">
                                            <CampoTexto
                                                etiqueta="Nombre del predio"
                                                valor={
                                                    datosGenerales.nombrePredio
                                                }
                                                icono={Navigation}
                                                onChange={(valor) =>
                                                    actualizarDato(
                                                        'nombrePredio',
                                                        valor,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </GrupoDatosGenerales>

                                <GrupoDatosGenerales
                                    titulo="Georreferenciación"
                                    descripcion="Coordenadas en grados decimales"
                                    icono={Navigation}
                                >
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <CampoTexto
                                            etiqueta="Longitud"
                                            valor={datosGenerales.longitud}
                                            tipo="number"
                                            icono={MapPin}
                                            placeholder="Ingrese la longitud"
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'longitud',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Latitud"
                                            valor={datosGenerales.latitud}
                                            tipo="number"
                                            icono={MapPin}
                                            placeholder="Ingrese la latitud"
                                            onChange={(valor) =>
                                                actualizarDato('latitud', valor)
                                            }
                                        />
                                    </div>
                                </GrupoDatosGenerales>

                                <GrupoDatosGenerales
                                    titulo="Actividad productiva"
                                    icono={Sprout}
                                >
                                    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                                        <CampoTexto
                                            etiqueta="Actividad productiva principal"
                                            valor={
                                                datosGenerales.actividadProductiva
                                            }
                                            icono={Sprout}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'actividadProductiva',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Hectáreas"
                                            valor={datosGenerales.hectareas}
                                            tipo="number"
                                            icono={Ruler}
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'hectareas',
                                                    valor,
                                                )
                                            }
                                        />
                                    </div>
                                </GrupoDatosGenerales>
                            </div>
                            <p className="mt-4 flex items-start gap-2 text-sm text-[#607665] dark:text-[#BFD9C5]">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                Los selectores se muestran como presentación
                                provisional hasta integrar los catálogos reales.
                                La georreferenciación permanece editable
                                manualmente.
                            </p>
                        </section>

                        {seccionesRUEA.map((seccion, indice) => {
                            const Icon = iconosSeccion[seccion.id];

                            return (
                                <TarjetaSeccion
                                    key={seccion.id}
                                    numero={seccion.numero}
                                    titulo={seccion.titulo}
                                    total={seccion.preguntas.length}
                                    icono={Icon}
                                    tono={tonosSeccion[indice]}
                                >
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {seccion.preguntas.map(
                                            (pregunta, indicePregunta) => (
                                                <PreguntaRUEA
                                                    key={pregunta.id}
                                                    numero={
                                                        indicePregunta +
                                                        1 +
                                                        seccionesRUEA
                                                            .slice(0, indice)
                                                            .reduce(
                                                                (total, item) =>
                                                                    total +
                                                                    item
                                                                        .preguntas
                                                                        .length,
                                                                0,
                                                            )
                                                    }
                                                    texto={pregunta.texto}
                                                    respuesta={
                                                        respuestas[pregunta.id]
                                                    }
                                                    onChange={(respuesta) =>
                                                        setRespuestas(
                                                            (
                                                                respuestasActuales,
                                                            ) => ({
                                                                ...respuestasActuales,
                                                                [pregunta.id]:
                                                                    respuesta,
                                                            }),
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                </TarjetaSeccion>
                            );
                        })}

                        <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#1B86B5] text-white shadow-[0_4px_0_#12668A]">
                                    <FileText className="size-5" />
                                </span>
                                <h2 className="text-xl font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                    Observaciones
                                </h2>
                            </div>
                            <CampoMultilinea
                                valor={observaciones}
                                onChange={setObservaciones}
                            />
                        </section>

                        <section className="grid gap-5 lg:grid-cols-2">
                            <BloqueFirma
                                titulo="Espacio para diligenciar el extensionista"
                                campos={[
                                    'Nombres y apellidos',
                                    'Número de cédula',
                                    'Perfil',
                                    'Firma',
                                ]}
                            />
                            <BloqueFirma
                                titulo="Espacio para diligenciar el usuario"
                                campos={['Firma', 'Número de cédula']}
                            />
                        </section>

                        <div className="flex flex-col gap-4 rounded-[28px] border-[1.5px] border-[#0E3B2A] bg-[#0E3B2A] px-5 py-5 shadow-[0_6px_0_#082519] sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div className="flex min-w-0 items-start gap-2 text-sm text-[#D3E8D6]">
                                <Hash className="mt-0.5 size-4 shrink-0 text-[#C8EA6B]" />
                                <p>
                                    {totalPreguntasRUEA} preguntas. Las
                                    respuestas se mantienen en esta vista hasta
                                    integrar el almacenamiento.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGuardarBorrador}
                                    className="min-h-12 rounded-2xl border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-6 text-[15px] font-extrabold text-[#10281D] hover:bg-[#E4F1DD]"
                                >
                                    <Save className="size-[18px]" />
                                    Guardar borrador
                                </Button>
                                <Button
                                    type="submit"
                                    className="min-h-12 rounded-2xl bg-[#FFC933] px-6 text-[15px] font-extrabold text-[#3A2A00] shadow-[0_4px_0_#B78A0E] hover:bg-[#FFD653]"
                                >
                                    <Save className="size-[18px]" />
                                    Guardar registro
                                </Button>
                            </div>
                            {avisoGuardado && (
                                <p
                                    role="status"
                                    className="basis-full text-sm font-semibold text-[#FFF2B2]"
                                >
                                    {avisoGuardado}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

CrearRUEA.layout = {
    breadcrumbs: [
        { title: 'Registro RUEA', href: index() },
        { title: 'Nuevo registro', href: crearRUEARoute() },
    ],
};
