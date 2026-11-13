import { Head, router, usePage } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { FormularioSeccionesNav } from '@/components/formulario-secciones-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SigraSelect } from '@/components/ui/sigra-select';
import { cn } from '@/lib/utils';
import { crear as crearRUEARoute, index } from '@/routes/registro-ruea';
import { toast } from 'sonner';
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

type Opcion = { value: string; label: string };

type Divipola = {
    divipola: number;
    codigo_departamento: string;
    nombre_departamento: string;
    codigo_municipio: string;
    nombre_municipio: string;
};

type Corregimiento = {
    corregimiento: number;
    divipola: number;
    nombre: string;
};

type Vereda = { vereda: number; corregimiento: number; nombre: string };

type PredioEncontrado = {
    predio: number;
    nombre: string;
    divipola: number;
    codigo_departamento?: string;
    nombre_departamento?: string;
    nombre_municipio?: string;
    corregimiento: number | null;
    nombre_corregimiento?: string;
    vereda: number | null;
    nombre_vereda?: string;
    latitud: string | number | null;
    longitud: string | number | null;
    hectareas: string | number | null;
    actividad_productiva?: string | null;
};

type ProductorEncontrado = {
    productor: number;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    tipo_documento: string;
    numero_documento: string;
    telefono?: string | null;
    fecha_nacimiento?: string | null;
    sexo?: string | null;
    predios: PredioEncontrado[];
};

type RegistroRUEA = {
    id: number;
    estado: 'borrador' | 'registrado';
    productor: ProductorEncontrado | null;
    predio: PredioEncontrado | null;
    observaciones: string;
    nombre_extensionista: string;
    numero_documento_extensionista: string;
    perfil_extensionista: string;
    respuestas: Record<string, string>;
};

type PageProps = {
    divipolas?: Divipola[];
    corregimientos?: Corregimiento[];
    veredas?: Vereda[];
    registro?: RegistroRUEA;
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

function formatearNumeroLegible(
    valor: string | number | null | undefined,
): string {
    const texto = String(valor ?? '').trim();
    if (texto === '') return 'Sin registrar';

    return texto
        .replace(/(\.\d*?[1-9])0+$/, '$1')
        .replace(/\.0+$/, '')
        .replace(/\.$/, '');
}

type CampoTextoProps = {
    etiqueta: string;
    valor: string;
    tipo?: 'text' | 'tel' | 'date' | 'number';
    icono?: LucideIcon;
    placeholder?: string;
    disabled?: boolean;
    onChange: (valor: string) => void;
};

type CampoSeleccionProps = {
    etiqueta: string;
    valor: string;
    options: Opcion[];
    icono?: LucideIcon;
    disabled?: boolean;
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

const seccionesNavRUEA = [
    {
        number: 1,
        label: 'Información principal',
        id: 'ruea-informacion-principal',
        colorClass: 'bg-[#17803D] text-white',
    },
    {
        number: 2,
        label: 'Capacidades humanas',
        id: 'capacidades-humanas-tecnicas',
        colorClass: 'bg-[#1B86B5] text-white',
    },
    {
        number: 3,
        label: 'Asociatividad',
        id: 'capacidades-sociales-asociatividad',
        colorClass: 'bg-[#E0573F] text-white',
    },
    {
        number: 4,
        label: 'TIC',
        id: 'informacion-tic',
        colorClass: 'bg-[#4E9A2B] text-white',
    },
    {
        number: 5,
        label: 'Recursos naturales',
        id: 'recursos-naturales',
        colorClass: 'bg-[#FFC933] text-[#3A2A00]',
    },
    {
        number: 6,
        label: 'Participación',
        id: 'habilidades-participacion',
        colorClass: 'bg-[#17803D] text-white',
    },
    {
        number: 7,
        label: 'Observaciones',
        id: 'ruea-observaciones',
        colorClass: 'bg-[#1B86B5] text-white',
    },
    {
        number: 8,
        label: 'Cierre',
        id: 'ruea-cierre',
        colorClass: 'bg-[#4E9A2B] text-white',
    },
] as const;

function CampoTexto({
    etiqueta,
    valor,
    tipo = 'text',
    icono: Icon,
    placeholder,
    disabled = false,
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
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    className={cn(
                        'h-12 rounded-2xl border-[1.5px] border-[#6F9479] bg-[#F7FBF4] text-[15px] text-[#10281D] shadow-none placeholder:text-[#607665] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus-visible:bg-[#294330]',
                        Icon && 'pl-12',
                        disabled &&
                            'border-[#557A62] bg-[#F0F8EC] text-[#355443] opacity-100 disabled:text-[#355443] disabled:opacity-100 dark:bg-[#24382A] dark:text-[#BFD9C5] dark:disabled:text-[#BFD9C5]',
                    )}
                />
            </span>
        </label>
    );
}

function CampoSeleccion({
    etiqueta,
    valor,
    options,
    icono: Icon = MapPin,
    disabled = false,
    onChange,
}: CampoSeleccionProps) {
    const campoId = `ruea-${useId().replace(/:/g, '')}`;

    return (
        <label htmlFor={campoId} className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-[#10281D] dark:text-[#E5F3E8]">
                {etiqueta}
            </span>
            <SigraSelect
                id={campoId}
                name={campoId}
                value={valor}
                onValueChange={onChange}
                icon={Icon}
                options={options}
                disabled={disabled}
            />
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
    id,
    children,
}: {
    numero: number;
    titulo: string;
    total: number;
    icono: LucideIcon;
    tono: TonoSeccion;
    id?: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-6 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
        >
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
    campo,
    numero,
    texto,
    respuesta,
    onChange,
}: {
    campo: string;
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
                                name={`respuestas[${campo}]`}
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

function BloqueFirma({
    titulo,
    campos,
    valores = {},
    onChange,
}: {
    titulo: string;
    campos: string[];
    valores?: Record<string, string>;
    onChange?: (campo: string, valor: string) => void;
}) {
    const bloqueId = `firma-${useId().replace(/:/g, '')}`;
    const clave = (campo: string) =>
        campo === 'Nombres y apellidos'
            ? 'nombre_extensionista'
            : campo === 'Número de cédula'
              ? 'numero_documento_extensionista'
              : campo === 'Perfil'
                ? 'perfil_extensionista'
                : campo;

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
                                value={
                                    onChange
                                        ? (valores[clave(campo)] ?? '')
                                        : undefined
                                }
                                placeholder={`Ingrese ${campo.toLocaleLowerCase('es')}`}
                                onChange={
                                    onChange
                                        ? (event) =>
                                              onChange(
                                                  clave(campo),
                                                  event.target.value,
                                              )
                                        : undefined
                                }
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
    const {
        divipolas = [],
        corregimientos = [],
        veredas = [],
        registro,
    } = usePage<PageProps>().props;
    const [datosGenerales, setDatosGenerales] = useState<DatosGenerales>(
        datosGeneralesIniciales,
    );
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});
    const [observaciones, setObservaciones] = useState('');
    const [productorSeleccionado, setProductorSeleccionado] =
        useState<ProductorEncontrado | null>(registro?.productor ?? null);
    const [predioSeleccionado, setPredioSeleccionado] = useState('');
    const [estadoConsulta, setEstadoConsulta] = useState<
        'inicial' | 'consultando' | 'encontrado' | 'no-encontrado' | 'error'
    >(registro?.productor ? 'encontrado' : 'inicial');
    const [mensajeConsulta, setMensajeConsulta] = useState('');
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [guardando, setGuardando] = useState(false);
    const [nombreExtensionista, setNombreExtensionista] = useState(
        registro?.nombre_extensionista ?? '',
    );
    const [numeroDocumentoExtensionista, setNumeroDocumentoExtensionista] =
        useState(registro?.numero_documento_extensionista ?? '');
    const [perfilExtensionista, setPerfilExtensionista] = useState(
        registro?.perfil_extensionista ?? '',
    );
    const identidadModificadaRef = useRef(false);
    const guardandoRef = useRef(false);
    const consultaRef = useRef<AbortController | null>(null);

    const actualizarDato = (campo: keyof DatosGenerales, valor: string) => {
        setDatosGenerales((datosActuales) => ({
            ...datosActuales,
            [campo]: valor,
        }));
    };

    const departamentos = useMemo<Opcion[]>(() => {
        const unicos = new Map<string, string>();
        divipolas.forEach((divipola) =>
            unicos.set(
                String(divipola.codigo_departamento),
                `${divipola.codigo_departamento} · ${divipola.nombre_departamento}`,
            ),
        );

        return Array.from(unicos, ([value, label]) => ({ value, label }));
    }, [divipolas]);
    const municipios = useMemo<Opcion[]>(
        () =>
            divipolas
                .filter(
                    (divipola) =>
                        String(divipola.codigo_departamento) ===
                        datosGenerales.departamento,
                )
                .map((divipola) => ({
                    value: String(divipola.divipola),
                    label: divipola.nombre_municipio,
                })),
        [datosGenerales.departamento, divipolas],
    );
    const corregimientosVisibles = useMemo<Opcion[]>(
        () =>
            corregimientos
                .filter(
                    (corregimiento) =>
                        String(corregimiento.divipola) ===
                        datosGenerales.municipio,
                )
                .map((corregimiento) => ({
                    value: String(corregimiento.corregimiento),
                    label: corregimiento.nombre,
                })),
        [corregimientos, datosGenerales.municipio],
    );
    const veredasVisibles = useMemo<Opcion[]>(
        () =>
            veredas
                .filter(
                    (vereda) =>
                        String(vereda.corregimiento) ===
                        datosGenerales.corregimiento,
                )
                .map((vereda) => ({
                    value: String(vereda.vereda),
                    label: vereda.nombre,
                })),
        [datosGenerales.corregimiento, veredas],
    );
    const prediosDisponibles = useMemo<Opcion[]>(
        () =>
            (productorSeleccionado?.predios ?? []).map((predio) => ({
                value: String(predio.predio),
                label: predio.nombre,
            })),
        [productorSeleccionado],
    );

    const aplicarDatosProductor = (productor: ProductorEncontrado) => {
        setDatosGenerales((actuales) => ({
            ...actuales,
            nombreCompleto: productor.nombre_completo,
            tipoDocumento: productor.tipo_documento,
            numeroDocumento: productor.numero_documento,
            telefono: productor.telefono ?? '',
            fechaNacimiento: productor.fecha_nacimiento ?? '',
            sexo: productor.sexo ?? '',
        }));
    };

    const aplicarDatosPredio = (predio: PredioEncontrado | null) => {
        if (predio === null) {
            setPredioSeleccionado('');
            setDatosGenerales((actuales) => ({
                ...actuales,
                departamento: '',
                municipio: '',
                corregimiento: '',
                vereda: '',
                nombrePredio: '',
                longitud: '',
                latitud: '',
                actividadProductiva: '',
                hectareas: '',
            }));
            return;
        }

        setPredioSeleccionado(String(predio.predio));
        setDatosGenerales((actuales) => ({
            ...actuales,
            departamento: String(predio.codigo_departamento ?? ''),
            municipio: String(predio.divipola ?? ''),
            corregimiento: String(predio.corregimiento ?? ''),
            vereda: String(predio.vereda ?? ''),
            nombrePredio: predio.nombre,
            longitud: String(predio.longitud ?? ''),
            latitud: String(predio.latitud ?? ''),
            actividadProductiva: predio.actividad_productiva ?? '',
            hectareas: String(predio.hectareas ?? ''),
        }));
    };

    useEffect(() => {
        if (!registro) return;

        setProductorSeleccionado(registro.productor);
        setPredioSeleccionado(String(registro.predio?.predio ?? ''));
        setRespuestas(registro.respuestas ?? {});
        setObservaciones(registro.observaciones ?? '');
        setNombreExtensionista(registro.nombre_extensionista ?? '');
        setNumeroDocumentoExtensionista(
            registro.numero_documento_extensionista ?? '',
        );
        setPerfilExtensionista(registro.perfil_extensionista ?? '');
        setDatosGenerales((actuales) => ({
            ...actuales,
            ...(registro.productor
                ? {
                      nombreCompleto: registro.productor.nombre_completo,
                      tipoDocumento: registro.productor.tipo_documento,
                      numeroDocumento: registro.productor.numero_documento,
                      telefono: registro.productor.telefono ?? '',
                      fechaNacimiento:
                          registro.productor.fecha_nacimiento ?? '',
                      sexo: registro.productor.sexo ?? '',
                  }
                : {}),
            ...(registro.predio
                ? {
                      departamento: String(
                          registro.predio.codigo_departamento ?? '',
                      ),
                      municipio: String(registro.predio.divipola),
                      corregimiento: String(
                          registro.predio.corregimiento ?? '',
                      ),
                      vereda: String(registro.predio.vereda ?? ''),
                      nombrePredio: registro.predio.nombre,
                      longitud: String(registro.predio.longitud ?? ''),
                      latitud: String(registro.predio.latitud ?? ''),
                      actividadProductiva:
                          registro.predio.actividad_productiva ?? '',
                      hectareas: String(registro.predio.hectareas ?? ''),
                  }
                : {}),
        }));
    }, [registro]);

    useEffect(() => {
        const tipo = datosGenerales.tipoDocumento.trim();
        const numero = datosGenerales.numeroDocumento.trim();
        if (!identidadModificadaRef.current && registro?.productor) return;
        if (tipo === '' || numero.length < 3) {
            setEstadoConsulta('inicial');
            return;
        }

        const controlador = new AbortController();
        consultaRef.current?.abort();
        consultaRef.current = controlador;
        const temporizador = window.setTimeout(() => {
            setEstadoConsulta('consultando');
            setMensajeConsulta('');
            fetch(
                `/visitas-extensionismo/productores?tipo_documento=${encodeURIComponent(tipo)}&numero_documento=${encodeURIComponent(numero)}`,
                {
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                    signal: controlador.signal,
                },
            )
                .then(async (respuesta) => {
                    if (!respuesta.ok) throw new Error('consulta-fallida');
                    const datos = (await respuesta.json()) as unknown;
                    if (!Array.isArray(datos))
                        throw new Error('respuesta-invalida');

                    return datos as ProductorEncontrado[];
                })
                .then((productores) => {
                    if (productores.length === 0) {
                        setProductorSeleccionado(null);
                        aplicarDatosPredio(null);
                        setEstadoConsulta('no-encontrado');
                        setMensajeConsulta(
                            'No encontramos este productor. Debe registrarse primero mediante Visitas de extensionismo.',
                        );
                        return;
                    }

                    const productor = productores[0];
                    setProductorSeleccionado(productor);
                    aplicarDatosProductor(productor);
                    setEstadoConsulta('encontrado');
                    if (productores.length > 1) {
                        setMensajeConsulta(
                            'Encontramos más de un resultado. Verifica el documento ingresado.',
                        );
                    }
                    if (productor.predios.length === 1) {
                        aplicarDatosPredio(productor.predios[0]);
                    } else if (productor.predios.length === 0) {
                        aplicarDatosPredio(null);
                    }
                })
                .catch((error: unknown) => {
                    if (
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    )
                        return;
                    setEstadoConsulta('error');
                    setMensajeConsulta(
                        'No fue posible consultar el productor. Puedes reintentar.',
                    );
                });
        }, 300);

        return () => {
            window.clearTimeout(temporizador);
            controlador.abort();
        };
    }, [
        datosGenerales.numeroDocumento,
        datosGenerales.tipoDocumento,
        registro?.productor,
    ]);

    const seleccionarPredio = (id: string) => {
        const predio = productorSeleccionado?.predios.find(
            (item) => String(item.predio) === id,
        );
        aplicarDatosPredio(predio ?? null);
    };

    const actualizarIdentidad = (
        campo: 'tipoDocumento' | 'numeroDocumento',
        valor: string,
    ) => {
        identidadModificadaRef.current = true;
        setProductorSeleccionado(null);
        aplicarDatosPredio(null);
        setDatosGenerales((actuales) => ({
            ...actuales,
            [campo]: valor,
            nombreCompleto: '',
            telefono: '',
            fechaNacimiento: '',
            sexo: '',
        }));
    };

    const enviarFormulario = (definitivo: boolean) => {
        if (guardandoRef.current) return;
        guardandoRef.current = true;
        setGuardando(true);
        setErrores({});

        const datos = {
            productor: productorSeleccionado?.productor ?? null,
            predio: predioSeleccionado ? Number(predioSeleccionado) : null,
            observaciones,
            nombre_extensionista: nombreExtensionista,
            numero_documento_extensionista: numeroDocumentoExtensionista,
            perfil_extensionista: perfilExtensionista,
            respuestas,
        };
        const ruta = registro
            ? `/registro-ruea/${registro.id}${definitivo ? '' : '/borrador'}`
            : definitivo
              ? '/registro-ruea'
              : '/registro-ruea/borrador';

        router.post(ruta, registro ? { ...datos, _method: 'put' } : datos, {
            onError: (errors) => {
                const normalizados = Object.fromEntries(
                    Object.entries(errors).map(([campo, mensaje]) => [
                        campo,
                        Array.isArray(mensaje)
                            ? mensaje.join(' ')
                            : String(mensaje),
                    ]),
                );
                setErrores(normalizados);
                toast.error(
                    definitivo
                        ? 'No fue posible guardar el RUEA. Revisa los errores indicados e inténtalo nuevamente.'
                        : 'No fue posible guardar el borrador RUEA. Revisa los errores indicados e inténtalo nuevamente.',
                );
            },
            onFinish: () => {
                guardandoRef.current = false;
                setGuardando(false);
            },
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        enviarFormulario(true);
    };

    const handleGuardarBorrador = () => enviarFormulario(false);

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
                        badges={[
                            {
                                label: registro
                                    ? 'Editar registro'
                                    : 'Nuevo registro',
                                tone: 'accent',
                            },
                        ]}
                    />

                    <FormularioSeccionesNav sections={seccionesNavRUEA} />

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6"
                    >
                        <section
                            id="ruea-informacion-principal"
                            className="scroll-mt-6 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                        >
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
                                    <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1.6fr]">
                                        <CampoSeleccion
                                            etiqueta="Tipo de documento"
                                            valor={datosGenerales.tipoDocumento}
                                            options={[
                                                {
                                                    value: 'Cédula de ciudadanía',
                                                    label: 'Cédula de ciudadanía',
                                                },
                                                {
                                                    value: 'Tarjeta de identidad',
                                                    label: 'Tarjeta de identidad',
                                                },
                                                {
                                                    value: 'Cédula de extranjería',
                                                    label: 'Cédula de extranjería',
                                                },
                                                {
                                                    value: 'Pasaporte',
                                                    label: 'Pasaporte',
                                                },
                                            ]}
                                            onChange={(valor) =>
                                                actualizarIdentidad(
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
                                                actualizarIdentidad(
                                                    'numeroDocumento',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Nombre completo"
                                            valor={
                                                datosGenerales.nombreCompleto
                                            }
                                            icono={UserRound}
                                            disabled
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'nombreCompleto',
                                                    valor,
                                                )
                                            }
                                        />
                                    </div>
                                </GrupoDatosGenerales>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-[#B5CAAE] bg-[#F7FBF4] p-4 text-sm text-[#3E5547] dark:border-[#3E5B46] dark:bg-[#22352A] dark:text-[#BFD9C5]">
                                        {estadoConsulta === 'consultando' &&
                                            'Verificando el documento…'}
                                        {estadoConsulta === 'encontrado' &&
                                            productorSeleccionado &&
                                            'Productor encontrado. Selecciona uno de sus predios.'}
                                        {estadoConsulta === 'no-encontrado' &&
                                            mensajeConsulta}
                                        {estadoConsulta === 'error' && (
                                            <span role="alert">
                                                {mensajeConsulta}
                                            </span>
                                        )}
                                        {estadoConsulta === 'inicial' &&
                                            'Ingresa tipo y número de documento para consultar el productor.'}
                                    </div>
                                    <CampoSeleccion
                                        etiqueta="Predio del productor"
                                        valor={predioSeleccionado}
                                        options={prediosDisponibles}
                                        disabled={!productorSeleccionado}
                                        onChange={seleccionarPredio}
                                    />
                                </div>

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
                                            disabled
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
                                            options={[
                                                {
                                                    value: 'Femenino',
                                                    label: 'Femenino',
                                                },
                                                {
                                                    value: 'Masculino',
                                                    label: 'Masculino',
                                                },
                                            ]}
                                            disabled
                                            onChange={(valor) =>
                                                actualizarDato('sexo', valor)
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Número de teléfono"
                                            tipo="tel"
                                            valor={datosGenerales.telefono}
                                            icono={Phone}
                                            disabled
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
                                            options={departamentos}
                                            disabled
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
                                            options={municipios}
                                            disabled
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'municipio',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoSeleccion
                                            etiqueta="Corregimiento"
                                            valor={datosGenerales.corregimiento}
                                            options={corregimientosVisibles}
                                            disabled
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'corregimiento',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoSeleccion
                                            etiqueta="Vereda"
                                            valor={datosGenerales.vereda}
                                            options={veredasVisibles}
                                            disabled
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
                                                disabled
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
                                            disabled
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
                                            disabled
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
                                            disabled
                                            onChange={(valor) =>
                                                actualizarDato(
                                                    'actividadProductiva',
                                                    valor,
                                                )
                                            }
                                        />
                                        <CampoTexto
                                            etiqueta="Hectáreas"
                                            valor={formatearNumeroLegible(
                                                datosGenerales.hectareas,
                                            )}
                                            icono={Ruler}
                                            disabled
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
                                Los datos del productor y del predio se
                                recuperan desde los registros existentes. RUEA
                                no modifica productores ni predios.
                            </p>
                        </section>

                        {seccionesRUEA.map((seccion, indice) => {
                            const Icon = iconosSeccion[seccion.id];

                            return (
                                <TarjetaSeccion
                                    key={seccion.id}
                                    id={seccion.id}
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
                                                    campo={pregunta.id}
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

                        <section
                            id="ruea-observaciones"
                            className="scroll-mt-6 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                        >
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

                        <section
                            id="ruea-cierre"
                            className="grid scroll-mt-6 gap-5 lg:grid-cols-2"
                        >
                            <BloqueFirma
                                titulo="Espacio para diligenciar el extensionista"
                                campos={[
                                    'Nombres y apellidos',
                                    'Número de cédula',
                                    'Perfil',
                                    'Firma',
                                ]}
                                valores={{
                                    nombre_extensionista: nombreExtensionista,
                                    numero_documento_extensionista:
                                        numeroDocumentoExtensionista,
                                    perfil_extensionista: perfilExtensionista,
                                }}
                                onChange={(campo, valor) => {
                                    if (campo === 'nombre_extensionista') {
                                        setNombreExtensionista(valor);
                                    } else if (
                                        campo ===
                                        'numero_documento_extensionista'
                                    ) {
                                        setNumeroDocumentoExtensionista(valor);
                                    } else if (
                                        campo === 'perfil_extensionista'
                                    ) {
                                        setPerfilExtensionista(valor);
                                    }
                                }}
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
                                    respuestas se guardan con su código oficial.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGuardarBorrador}
                                    disabled={guardando}
                                    className="min-h-12 rounded-2xl border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-6 text-[15px] font-extrabold text-[#10281D] hover:bg-[#E4F1DD]"
                                >
                                    <Save className="size-[18px]" />
                                    Guardar borrador
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={guardando}
                                    className="min-h-12 rounded-2xl bg-[#FFC933] px-6 text-[15px] font-extrabold text-[#3A2A00] shadow-[0_4px_0_#B78A0E] hover:bg-[#FFD653]"
                                >
                                    <Save className="size-[18px]" />
                                    Guardar registro
                                </Button>
                            </div>
                            {Object.entries(errores).length > 0 && (
                                <p
                                    role="alert"
                                    className="basis-full text-sm font-semibold text-[#FFD2C8]"
                                >
                                    Revisa:{' '}
                                    {Object.entries(errores)
                                        .map(
                                            ([campo, error]) =>
                                                `${campo}: ${error}`,
                                        )
                                        .join(' · ')}
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
