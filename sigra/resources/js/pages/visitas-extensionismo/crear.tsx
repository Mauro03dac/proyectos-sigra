import { Head, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement, ReactNode } from 'react';
import {
    cloneElement,
    isValidElement,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import {
    BookOpen,
    CalendarDays,
    Camera,
    Check,
    ChevronDown,
    ClipboardCheck,
    ClipboardList,
    CloudUpload,
    FileText,
    Flag,
    GraduationCap,
    Hash,
    Home,
    Landmark,
    Layers,
    Leaf,
    Lightbulb,
    LocateFixed,
    MapPin,
    MessageCircle,
    Pencil,
    Phone,
    Ruler,
    Save,
    Tag,
    Target,
    UserRound,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FormularioHeader } from '@/components/formulario-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { crear, index } from '@/routes/visitas-extensionismo';
import { cn } from '@/lib/utils';

type SectionTone = 'green' | 'blue' | 'leaf' | 'coral' | 'yellow';

type Catalogo = { [key: string]: string | number };
type Predio = { predio: number; nombre: string; divipola?: number; corregimiento?: number; vereda?: number; latitud?: string; longitud?: string };
type ProductorEncontrado = { productor: number; nombres: string; apellidos: string; tipo_documento: string; numero_documento: string; telefono?: string; sexo?: string; predios: Predio[] };
type VisitaEdicion = { id: number; estado: string; campos: Record<string, string | number | boolean | null>; nombres?: string; apellidos?: string; tipo_documento?: string; numero_documento?: string; telefono?: string; sexo?: string; productor_existente?: number; predio_existente?: number; nombre_predio?: string; divipola?: number; corregimiento?: number; vereda?: number; latitud?: string; longitud?: string; enfoques_poblacionales?: number[]; fotografias?: Array<{ id?: number; nombre?: string }> };
type PageProps = { divipolas?: Catalogo[]; corregimientos?: Catalogo[]; veredas?: Catalogo[]; lineasProductivas?: Catalogo[]; especiesProductivas?: Catalogo[]; enfoquesPoblacionales?: Catalogo[]; visita?: VisitaEdicion };

const nombresCampos: Record<string, string> = {
    Fecha: 'fecha_visita', Departamento: 'departamento', Municipio: 'divipola', Corregimiento: 'corregimiento', Vereda: 'vereda', 'Nombre del predio': 'nombre_predio', Latitud: 'latitud', Longitud: 'longitud', Nombres: 'nombres', Apellidos: 'apellidos', 'Número de cédula': 'numero_documento', 'Número de celular': 'telefono', 'Línea productiva priorizada (extensión agropecuaria)': 'linea_productiva_principal', Especie: 'especie_productiva', 'Línea productiva secundaria': 'linea_productiva_secundaria', 'Número de animales': 'numero_animales', 'Área destinada en la línea productiva priorizada (hectáreas)': 'area_hectareas', 'Tipo de discapacidad': 'tipo_discapacidad', Puntaje: 'puntaje_sisben', 'Nombre de la asociación, cooperativa o gremio': 'nombre_asociacion', 'Nombre del aspecto objeto de la visita': 'aspecto_visita', 'Nombre del componente objeto de la visita': 'componente_visita', Diagnóstico: 'diagnostico', 'Actividades realizadas': 'actividades_realizadas', Recomendaciones: 'recomendaciones', 'Compromisos para la próxima visita': 'compromisos', 'Nombres y apellidos': 'nombre_extensionista', Disciplina: 'disciplina_extensionista', 'Título académico': 'titulo_academico_extensionista', 'Firma (usuario)': 'firma_usuario', 'Firma (extensionista)': 'firma_extensionista',
};

type SectionCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    tone: SectionTone;
    number: string;
    children: ReactNode;
    id?: string;
    className?: string;
};

const toneStyles: Record<SectionTone, string> = {
    green: 'bg-[#17803D] text-white',
    blue: 'bg-[#1B86B5] text-white',
    leaf: 'bg-[#4E9A2B] text-white',
    coral: 'bg-[#E0573F] text-white',
    yellow: 'bg-[#FFC933] text-[#3A2A00]',
};

function SectionCard({
    title,
    description,
    icon: Icon,
    tone,
    number,
    children,
    id,
    className,
}: SectionCardProps) {
    return (
        <section
            id={id}
            className={cn(
                'scroll-mt-6 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-[22px] shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px]',
                className,
            )}
        >
            <div className="mb-6 flex items-start gap-4 border-b-2 border-dashed border-[#B5CAAE] pb-5">
                <span
                    className={cn(
                        'flex size-[58px] shrink-0 -rotate-[4deg] items-center justify-center rounded-[20px] shadow-[0_5px_0_rgba(0,0,0,0.2)]',
                        toneStyles[tone],
                    )}
                >
                    <Icon className="size-7" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                    <span className="mb-1 block text-[15px] font-extrabold text-[#3E5547]">
                        Paso {Number(number)} de 14
                    </span>
                    <h2 className="text-[22px] leading-[1.15] font-extrabold tracking-[-0.02em] text-[#10281D]">
                        {title}
                    </h2>
                    <p className="mt-1 text-[15px] leading-[1.45] text-[#3E5547]">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

function FieldLabel({
    children,
    required = false,
    id,
    htmlFor,
}: {
    children: ReactNode;
    required?: boolean;
    id?: string;
    htmlFor?: string;
}) {
    return (
        <Label
            id={id}
            htmlFor={htmlFor}
            className="mb-2.5 block text-[15px] leading-[1.4] font-semibold text-[#10281D]"
        >
            {children}
            {required && (
                <span aria-hidden="true" className="ml-0.5 text-[#B93A0B]">
                    *
                </span>
            )}
        </Label>
    );
}

function Field({
    label,
    required = false,
    children,
    className,
    name,
}: {
    label: ReactNode;
    required?: boolean;
    children: ReactNode;
    className?: string;
    name?: string;
}) {
    const generatedId = `campo-${useId().replace(/:/g, '')}`;
    const labelId = `${generatedId}-label`;
    const accessibleChild = isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
              id: generatedId,
              name: name ?? (typeof label === 'string' ? (nombresCampos[label] ?? generatedId) : generatedId),
              'aria-labelledby': labelId,
              ...(required ? { 'aria-required': true, required: true } : {}),
          })
        : children;

    return (
        <div className={cn('min-w-0', className)}>
            <FieldLabel id={labelId} htmlFor={generatedId} required={required}>
                {label}
            </FieldLabel>
            {accessibleChild}
        </div>
    );
}

function FieldControl({
    className,
    icon: Icon,
    ...props
}: React.ComponentProps<typeof Input> & { icon?: LucideIcon }) {
    return (
        <div className="relative">
            {Icon && (
                <Icon
                    className="pointer-events-none absolute top-1/2 left-[17px] z-10 size-5 -translate-y-1/2 text-[#2F6A45]"
                    strokeWidth={1.9}
                />
            )}
            <Input
                {...props}
                className={cn(
                    'h-[50px] rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] text-[16px] text-[#10281D] shadow-none placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30',
                    Icon && 'pl-[52px]',
                    className,
                )}
            />
        </div>
    );
}

function SelectField({
    icon: Icon,
    options,
    placeholder = 'Seleccione...',
    value,
    onValueChange,
    id,
    name,
    'aria-labelledby': ariaLabelledby,
    'aria-required': ariaRequired,
    required,
}: {
    icon?: LucideIcon;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    id?: string;
    name?: string;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    required?: boolean;
}) {
    return (
        <div className="relative">
            {Icon && (
                <Icon
                    className="pointer-events-none absolute top-1/2 left-[17px] z-10 size-5 -translate-y-1/2 text-[#2F6A45]"
                    strokeWidth={1.9}
                />
            )}
            <select
                id={id}
                name={name}
                aria-labelledby={ariaLabelledby}
                aria-required={ariaRequired}
                required={required}
                value={value}
                onChange={(event) => onValueChange?.(event.target.value)}
                className={cn(
                    'h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] pr-12 text-[16px] text-[#10281D] transition outline-none hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 [&_option]:text-[16px]',
                    Icon && 'pl-[52px]',
                )}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute top-1/2 right-[14px] size-[18px] -translate-y-1/2 text-[#17803D]"
                strokeWidth={2.6}
            />
        </div>
    );
}

function TextAreaField({
    placeholder,
    rows = 3,
    className,
    id,
    name,
    'aria-labelledby': ariaLabelledby,
    'aria-required': ariaRequired,
    required,
}: {
    placeholder: string;
    rows?: number;
    className?: string;
    id?: string;
    name?: string;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    required?: boolean;
}) {
    return (
        <textarea
            id={id}
            name={name}
            aria-labelledby={ariaLabelledby}
            aria-required={ariaRequired}
            required={required}
            rows={rows}
            placeholder={placeholder}
            className={cn(
                'block min-h-[140px] w-full resize-y rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] py-4 text-[16px] leading-[1.5] text-[#10281D] outline-none placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30',
                className,
            )}
        />
    );
}

function CheckOption({
    children,
    className,
    name,
    value,
}: {
    children: ReactNode;
    className?: string;
    name?: string;
    value?: string;
}) {
    return (
        <label
            className={cn(
                'relative inline-flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-full border-[1.5px] border-[#6F9479] bg-[#F7FBF4] py-1 pr-5 pl-[13px] text-[15px] leading-[1.35] font-semibold text-[#10281D] transition hover:border-[#17803D] hover:bg-white has-[:checked]:border-[#17803D] has-[:checked]:bg-[#17803D] has-[:checked]:font-bold has-[:checked]:text-white has-[:checked]:shadow-[0_3px_0_#0E3B2A]',
                className,
            )}
        >
            <input
                type="checkbox"
                name={name ?? (typeof children === 'string' && children === 'Víctima del conflicto armado' ? 'victima_conflicto_armado' : 'enfoques_poblacionales[]')}
                value={value ?? (typeof children === 'string' ? children : '')}
                className="peer m-0 size-[21px] shrink-0 appearance-none rounded-[7px] border-2 border-[#5E7A66] bg-white transition checked:border-white checked:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#4E9A2B]/60"
            />
            <Check
                className="pointer-events-none absolute top-1/2 left-4 hidden size-[15px] -translate-y-1/2 text-[#17803D] peer-checked:block"
                strokeWidth={3}
            />
            <span>{children}</span>
        </label>
    );
}

function RadioOption({
    name,
    value,
    required = false,
}: {
    name: string;
    value: string;
    required?: boolean;
}) {
    return (
        <label className="relative cursor-pointer">
            <input
                name={name}
                value={value}
                type="radio"
                required={required}
                className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
            />
            <span className="flex min-h-[46px] items-center justify-center rounded-[14px] px-6 text-[15px] font-bold text-[#10281D] transition peer-checked:bg-[#17803D] peer-checked:text-white peer-checked:shadow-[0_3px_0_#0E3B2A] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-[#4E9A2B]/60">
                {value}
            </span>
        </label>
    );
}

function SignatureBox({
    onAdd,
    added,
    className,
}: {
    onAdd: () => void;
    added: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onAdd}
            className={cn(
                'flex min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-[24px] border-[2.5px] border-dashed border-[#4E9A2B] bg-[#F0F7EC] p-5 text-[16px] font-extrabold text-[#17803D] transition hover:border-[#17803D] hover:bg-[#E4F1DD]',
                className,
            )}
        >
            {added ? (
                <span className="flex size-[58px] items-center justify-center rounded-full bg-[#FFC933] text-[#3A2A00] shadow-[0_4px_0_#B78A0E]">
                    <Check className="size-7" />
                </span>
            ) : (
                <span className="flex size-[58px] items-center justify-center rounded-full bg-[#FFC933] text-[#3A2A00] shadow-[0_4px_0_#B78A0E]">
                    <Pencil className="size-7" />
                </span>
            )}
            <span>{added ? 'Firma agregada' : 'Agregar firma'}</span>
        </button>
    );
}

export default function CrearVisitaExtensionismo() {
    const { divipolas = [], corregimientos = [], veredas = [], lineasProductivas = [], especiesProductivas = [], enfoquesPoblacionales = [], visita } = usePage<PageProps>().props;
    const formularioRef = useRef<HTMLFormElement | null>(null);
    const [primaryLine, setPrimaryLine] = useState(String(visita?.campos.linea_productiva_principal ?? ''));
    const [productorSeleccionado, setProductorSeleccionado] = useState<ProductorEncontrado | null>(null);
    const [resultadosProductor, setResultadosProductor] = useState<ProductorEncontrado[]>([]);
    const [buscandoProductor, setBuscandoProductor] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [predioExistente, setPredioExistente] = useState(String(visita?.predio_existente ?? ''));
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [latitud, setLatitud] = useState('');
    const [longitud, setLongitud] = useState('');
    const [mensajeGeolocalizacion, setMensajeGeolocalizacion] = useState('');
    const [precisionGeolocalizacion, setPrecisionGeolocalizacion] = useState<
        number | null
    >(null);
    const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
    const [extensionistSignatureAdded, setExtensionistSignatureAdded] =
        useState(false);
    const [signatureAdded, setSignatureAdded] = useState(false);
    const [mensajeBorrador, setMensajeBorrador] = useState('');
    const solicitudAutomaticaRealizadaRef = useRef(false);
    const coordenadasEditadasManualmenteRef = useRef(false);
    const consultaProductorRef = useRef<AbortController | null>(null);
    const secuenciaConsultaProductorRef = useRef(0);
    const identidadProductorModificadaRef = useRef(false);

    useEffect(() => {
        if (!visita || !formularioRef.current) return;
        const valores: Record<string, unknown> = { ...visita.campos, nombres: visita.nombres, apellidos: visita.apellidos, tipo_documento: visita.tipo_documento, numero_documento: visita.numero_documento, telefono: visita.telefono, sexo: visita.sexo, productor_existente: visita.productor_existente, predio_existente: visita.predio_existente, nombre_predio: visita.nombre_predio, divipola: visita.divipola, corregimiento: visita.corregimiento, vereda: visita.vereda, latitud: visita.latitud, longitud: visita.longitud, sisben: visita.campos.afiliado_sisben, asociacion: visita.campos.afiliado_asociacion };
        Object.entries(valores).forEach(([nombre, valor]) => {
            if (valor === null || valor === undefined) return;
            const controles = Array.from(formularioRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${nombre}"]`) ?? []);
            const valorTexto = nombre === 'fecha_visita' ? String(valor).slice(0, 10) : String(valor);
            controles.forEach((control) => {
                if (control instanceof HTMLInputElement && (control.type === 'radio' || control.type === 'checkbox')) {
                    const valorBooleano = valor === true || valorTexto === '1' || valorTexto === 'true';
                    control.checked = control.value === valorTexto || (control.type === 'radio' && (valorBooleano ? control.value === 'Sí' : control.value === 'No')) || (control.type === 'checkbox' && valorBooleano);
                } else {
                    control.value = valorTexto;
                }
            });
        });
        setLatitud(String(visita.latitud ?? ''));
        setLongitud(String(visita.longitud ?? ''));
        visita.enfoques_poblacionales?.forEach((id) => { const control = formularioRef.current?.querySelector<HTMLInputElement>(`input[name="enfoques_poblacionales[]"][value="${id}"]`); if (control) control.checked = true; });
    }, [visita]);

    const buscarProductor = (texto: string) => {
        if (texto.trim().length < 2) { setResultadosProductor([]); return; }
        consultaProductorRef.current?.abort();
        const controlador = new AbortController();
        consultaProductorRef.current = controlador;
        const secuencia = ++secuenciaConsultaProductorRef.current;
        setBuscandoProductor(true); setErrorBusqueda('');
        window.setTimeout(() => fetch(`/visitas-extensionismo/productores?numero_documento=${encodeURIComponent(texto)}`, { headers: { Accept: 'application/json' }, signal: controlador.signal })
            .then(async (respuesta) => { if (!respuesta.ok) throw new Error(); return respuesta.json() as Promise<ProductorEncontrado[]>; })
            .then((resultados) => { if (secuencia === secuenciaConsultaProductorRef.current) setResultadosProductor(resultados); })
            .catch((error: unknown) => { if (error instanceof DOMException && error.name === 'AbortError') return; if (secuencia === secuenciaConsultaProductorRef.current) setErrorBusqueda('No fue posible consultar los productores.'); })
            .finally(() => { if (secuencia === secuenciaConsultaProductorRef.current) setBuscandoProductor(false); }), 300);
    };
    const seleccionarProductor = (productor: ProductorEncontrado) => {
        identidadProductorModificadaRef.current = false;
        setProductorSeleccionado(productor); setResultadosProductor([]); setPredioExistente('');
        const valores = { productor_existente: productor.productor, nombres: productor.nombres, apellidos: productor.apellidos, tipo_documento: productor.tipo_documento, numero_documento: productor.numero_documento, telefono: productor.telefono ?? '', sexo: productor.sexo ?? '' };
        Object.entries(valores).forEach(([nombre, valor]) => { const control = formularioRef.current?.elements.namedItem(nombre) as HTMLInputElement | HTMLSelectElement | null; if (control) control.value = String(valor); });
    };
    const seleccionarPredio = (id: string) => {
        setPredioExistente(id); const predio = productorSeleccionado?.predios.find((item) => String(item.predio) === id); if (!predio) return;
        const valores = { nombre_predio: predio.nombre, divipola: predio.divipola, corregimiento: predio.corregimiento, vereda: predio.vereda };
        Object.entries(valores).forEach(([nombre, valor]) => { const control = formularioRef.current?.elements.namedItem(nombre) as HTMLInputElement | HTMLSelectElement | null; if (control && valor) control.value = String(valor); });
        setLatitud(String(predio.latitud ?? '')); setLongitud(String(predio.longitud ?? ''));
    };

    const mostrarErrorGeolocalizacion = (error: GeolocationPositionError) => {
        const mensajes: Record<number, string> = {
            [error.PERMISSION_DENIED]:
                'El permiso de ubicación fue denegado. Puedes ingresar las coordenadas manualmente.',
            [error.POSITION_UNAVAILABLE]:
                'La ubicación no está disponible en este momento. Puedes ingresar las coordenadas manualmente.',
            [error.TIMEOUT]:
                'La consulta de ubicación agotó el tiempo de espera. Puedes intentarlo nuevamente o ingresar las coordenadas manualmente.',
        };

        setMensajeGeolocalizacion(
            mensajes[error.code] ??
                'No fue posible obtener la ubicación. Puedes ingresar las coordenadas manualmente.',
        );
        setPrecisionGeolocalizacion(null);
        setObteniendoUbicacion(false);
    };

    const obtenerUbicacion = (actualizarCoordenadas: boolean) => {
        if (!window.isSecureContext) {
            setMensajeGeolocalizacion(
                'La ubicación requiere una conexión segura. Puedes ingresar las coordenadas manualmente.',
            );
            return;
        }

        if (!navigator.geolocation) {
            setMensajeGeolocalizacion(
                'Este navegador no admite geolocalización. Puedes ingresar las coordenadas manualmente.',
            );
            return;
        }

        setObteniendoUbicacion(true);
        setMensajeGeolocalizacion('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (
                    actualizarCoordenadas ||
                    !coordenadasEditadasManualmenteRef.current
                ) {
                    setLatitud(position.coords.latitude.toFixed(6));
                    setLongitud(position.coords.longitude.toFixed(6));
                    setMensajeGeolocalizacion(
                        'Ubicación actualizada correctamente.',
                    );
                } else {
                    setMensajeGeolocalizacion(
                        'Se obtuvo la ubicación, pero se conservaron las coordenadas ingresadas manualmente.',
                    );
                }

                setPrecisionGeolocalizacion(
                    Math.round(position.coords.accuracy),
                );
                setObteniendoUbicacion(false);
            },
            mostrarErrorGeolocalizacion,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    };

    useEffect(() => {
        if (solicitudAutomaticaRealizadaRef.current) {
            return;
        }

        solicitudAutomaticaRealizadaRef.current = true;

        if (!window.isSecureContext) {
            setMensajeGeolocalizacion(
                'La ubicación requiere una conexión segura. Puedes ingresar las coordenadas manualmente.',
            );
            return;
        }

        if (!navigator.geolocation) {
            setMensajeGeolocalizacion(
                'Este navegador no admite geolocalización. Puedes ingresar las coordenadas manualmente.',
            );
            return;
        }

        const solicitarUbicacion = () => obtenerUbicacion(false);

        if (!navigator.permissions) {
            solicitarUbicacion();
            return;
        }

        navigator.permissions
            .query({ name: 'geolocation' })
            .then((permiso) => {
                if (permiso.state === 'denied') {
                    setMensajeGeolocalizacion(
                        'El permiso de ubicación está denegado. Puedes ingresar las coordenadas manualmente.',
                    );
                    return;
                }

                solicitarUbicacion();
            })
            .catch(solicitarUbicacion);
    }, []);

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPhotoFiles(
            Array.from(event.target.files ?? []).filter(
                (file) => file.size <= 5 * 1024 * 1024,
            ),
        );
    };

    const enviarFormulario = (definitivo: boolean) => {
        if (!formularioRef.current) return;
        const datos = new FormData(formularioRef.current);
        datos.set('productor_existente', productorSeleccionado ? String(productorSeleccionado.productor) : (visita && !identidadProductorModificadaRef.current ? String(visita.productor_existente ?? '') : ''));
        datos.set('predio_existente', predioExistente);
        const ruta = visita ? `/visitas-extensionismo/${visita.id}${definitivo ? '' : '/borrador'}` : (definitivo ? '/visitas-extensionismo' : '/visitas-extensionismo/borrador');
        if (visita) datos.set('_method', 'put');
        router.post(ruta, datos, { forceFormData: true, onSuccess: () => { if (!definitivo) setMensajeBorrador('Borrador guardado correctamente.'); }, onError: () => setMensajeBorrador('Revisa los campos indicados antes de guardar.') });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        enviarFormulario(true);
    };

    const handleGuardarBorrador = () => {
        enviarFormulario(false);
    };

    return (
        <>
            <Head title="Nueva visita de extensionismo" />
            <main
                className="sigra-jakarta sigra-pulido min-w-0 flex-1 bg-[#DCE8D2] px-4 py-5 pb-8 sm:px-8 sm:py-[26px] sm:pb-11 xl:px-10"
                style={{
                    backgroundImage:
                        'radial-gradient(#B9CFB0 1.5px, transparent 1.7px)',
                    backgroundSize: '24px 24px',
                }}
            >
                <div className="flex w-full flex-col gap-[26px]">
                    <FormularioHeader
                        title="Visita de extensionismo a predio"
                        description="Registra los datos de la visita paso a paso."
                        badges={[
                            { label: 'Nueva visita', tone: 'accent' },
                            { label: 'Formulario MI10-F58' },
                            { label: 'Versión 3' },
                            { label: 'Aprobado el 09/09/2024' },
                        ]}
                    />

                    <nav
                        aria-label="Secciones del formulario"
                        className="flex gap-2.5 overflow-x-auto px-0.5 pb-2.5"
                    >
                        {[
                            [
                                '1',
                                'Predio',
                                'predio',
                                'bg-[#17803D] text-white',
                            ],
                            [
                                '2',
                                'Usuario',
                                'usuario',
                                'bg-[#1B86B5] text-white',
                            ],
                            [
                                '3',
                                'Actividad',
                                'actividad',
                                'bg-[#4E9A2B] text-white',
                            ],
                            [
                                '4',
                                'Población',
                                'poblacion',
                                'bg-[#E0573F] text-white',
                            ],
                            [
                                '5',
                                'Afiliación',
                                'afiliacion',
                                'bg-[#FFC933] text-[#3A2A00]',
                            ],
                            [
                                '6',
                                'Visita',
                                'visita',
                                'bg-[#17803D] text-white',
                            ],
                            [
                                '7',
                                'Cierre',
                                'cierre',
                                'bg-[#1B86B5] text-white',
                            ],
                        ].map(([number, label, id, colorClass]) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                className="inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border-[1.5px] border-[#B5CAAE] bg-white px-5 pl-2 text-[15px] font-extrabold text-[#10281D] shadow-[0_3px_0_rgba(14,59,42,0.14)] transition hover:-translate-y-px hover:border-[#17803D]"
                            >
                                <b
                                    className={cn(
                                        'inline-flex size-8 items-center justify-center rounded-full text-[15px]',
                                        colorClass,
                                    )}
                                >
                                    {number}
                                </b>
                                {label}
                            </a>
                        ))}
                    </nav>

                    <form ref={formularioRef}
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-[26px] pb-2"
                    >
                        <SectionCard
                            id="predio"
                            number="01"
                            title="Datos del predio"
                            description="Información general de ubicación, identificación del predio y georreferenciación."
                            icon={MapPin}
                            tone="green"
                        >
                            <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                <Field
                                    label="Fecha"
                                    required
                                    className="md:col-span-3"
                                >
                                    <FieldControl
                                        type="date"
                                        icon={CalendarDays}
                                    />
                                </Field>
                                <Field
                                    label="Departamento"
                                    required
                                    className="md:col-span-4"
                                >
                                    <SelectField icon={MapPin} options={[...new Map(divipolas.map((item) => [String(item.codigo_departamento), { value: String(item.codigo_departamento), label: String(item.nombre_departamento) }])).values()]} />
                                </Field>
                                <Field
                                    label="Municipio"
                                    required
                                    className="md:col-span-5"
                                >
                                    <SelectField icon={MapPin} options={divipolas.map((item) => ({ value: String(item.divipola), label: `${item.codigo_municipio} · ${item.nombre_municipio}` }))} />
                                </Field>
                                <Field
                                    label="Corregimiento"
                                    required
                                    className="md:col-span-6"
                                >
                                    <SelectField icon={MapPin} options={corregimientos.map((item) => ({ value: String(item.corregimiento), label: String(item.nombre) }))} />
                                </Field>
                                <Field
                                    label="Vereda"
                                    required
                                    className="md:col-span-6"
                                >
                                    <SelectField icon={MapPin} options={veredas.map((item) => ({ value: String(item.vereda), label: String(item.nombre) }))} />
                                </Field>
                                <Field
                                    label="Nombre del predio"
                                    required
                                    className="md:col-span-12"
                                >
                                    <FieldControl
                                        icon={Home}
                                        placeholder="Ingrese el nombre del predio"
                                    />
                                </Field>
                                {productorSeleccionado && (
                                    <div className="md:col-span-12">
                                        <FieldLabel>Predio del productor</FieldLabel>
                                        <SelectField value={predioExistente} onValueChange={seleccionarPredio} icon={Home} placeholder="Registrar un predio nuevo" options={productorSeleccionado.predios.map((predio) => ({ value: String(predio.predio), label: predio.nombre }))} />
                                        <p className="mt-2 text-sm text-[#3E5547]">Selecciona un predio existente o deja esta opción vacía para registrar uno nuevo.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-[18px] rounded-[24px] border-[1.5px] border-[#9CC9DA] bg-[#E3F1F7] p-[22px]">
                                <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <div className="flex flex-col gap-4 md:col-span-12 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="text-[17px] font-extrabold text-[#10281D]">
                                                Punto de georreferenciación
                                            </div>
                                            <div className="mt-1 text-[15px] text-[#3E5547]">
                                                Coordenadas en grados decimales
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                obtenerUbicacion(true)
                                            }
                                            disabled={obteniendoUbicacion}
                                            className="min-h-12 rounded-[16px] bg-[#146E96] px-5 text-[15px] font-extrabold text-white shadow-[0_4px_0_#0D4E6B] hover:bg-[#0D5B7D] focus-visible:ring-[4px] focus-visible:ring-[#146E96]/35"
                                        >
                                            <LocateFixed className="size-5" />
                                            {obteniendoUbicacion
                                                ? 'Obteniendo ubicación...'
                                                : 'Usar mi ubicación actual'}
                                        </Button>
                                    </div>
                                    {(mensajeGeolocalizacion ||
                                        precisionGeolocalizacion !== null) && (
                                        <p
                                            role="status"
                                            className="text-[15px] leading-[1.45] text-[#3E5547] md:col-span-12"
                                        >
                                            {mensajeGeolocalizacion}
                                            {precisionGeolocalizacion !==
                                                null &&
                                                ` Precisión estimada: ${precisionGeolocalizacion} m.`}
                                        </p>
                                    )}
                                    <Field
                                        label="Latitud"
                                        required
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={MapPin}
                                            inputMode="decimal"
                                            placeholder="Ej. 5.337900"
                                            value={latitud}
                                            onChange={(event) => {
                                                coordenadasEditadasManualmenteRef.current = true;
                                                setLatitud(event.target.value);
                                            }}
                                        />
                                    </Field>
                                    <Field
                                        label="Longitud"
                                        required
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={MapPin}
                                            inputMode="decimal"
                                            placeholder="Ej. -72.395000"
                                            value={longitud}
                                            onChange={(event) => {
                                                coordenadasEditadasManualmenteRef.current = true;
                                                setLongitud(event.target.value);
                                            }}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="usuario"
                            number="02"
                            title="Caracterización del usuario"
                            description="Información básica y datos de contacto."
                            icon={UserRound}
                            tone="blue"
                        >
                            <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                <Field
                                    label="Nombres"
                                    required
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={UserRound}
                                        placeholder="Ingrese los nombres"
                                        onChange={(event) => { identidadProductorModificadaRef.current = true; setProductorSeleccionado(null); buscarProductor(event.target.value); }}
                                    />
                                </Field>
                                <Field
                                    label="Apellidos"
                                    required
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={UserRound}
                                        placeholder="Ingrese los apellidos"
                                        onChange={(event) => { identidadProductorModificadaRef.current = true; setProductorSeleccionado(null); buscarProductor(event.target.value); }}
                                    />
                                </Field>
                                <Field label="Tipo de documento" name="tipo_documento" required className="md:col-span-4">
                                    <SelectField icon={FileText} options={[{ value: 'Cédula de ciudadanía', label: 'Cédula de ciudadanía' }, { value: 'Tarjeta de identidad', label: 'Tarjeta de identidad' }, { value: 'Cédula de extranjería', label: 'Cédula de extranjería' }, { value: 'Pasaporte', label: 'Pasaporte' }]} />
                                </Field>
                                <Field
                                    label="Número de cédula"
                                    required
                                    className="md:col-span-4"
                                >
                                    <FieldControl
                                        icon={FileText}
                                        inputMode="numeric"
                                        placeholder="Ingrese el número de cédula"
                                        onChange={(event) => { identidadProductorModificadaRef.current = true; setProductorSeleccionado(null); setPredioExistente(''); buscarProductor(event.target.value); }}
                                    />
                                </Field>
                                <Field
                                    label="Número de celular"
                                    required
                                    className="md:col-span-4"
                                >
                                    <FieldControl
                                        icon={Phone}
                                        inputMode="tel"
                                        placeholder="Ingrese el número de celular"
                                    />
                                </Field>
                                <div className="md:col-span-4">
                                    <FieldLabel required>Sexo</FieldLabel>
                                    <div className="inline-flex gap-1 rounded-[18px] border-[1.5px] border-[#B3C7AE] bg-[#E3EDDF] p-1">
                                        <RadioOption
                                            name="sexo"
                                            value="Femenino"
                                            required
                                        />
                                        <RadioOption
                                            name="sexo"
                                            value="Masculino"
                                        />
                                    </div>
                                </div>
                                {(buscandoProductor || errorBusqueda || resultadosProductor.length > 0) && (
                                    <div className="rounded-[16px] border border-[#B5CAAE] bg-[#F7FBF4] p-3 md:col-span-12">
                                        {buscandoProductor && <p className="text-sm text-[#3E5547]">Buscando productor…</p>}
                                        {errorBusqueda && <p className="text-sm text-[#B93A0B]">{errorBusqueda}</p>}
                                        {resultadosProductor.map((productor) => <button key={productor.productor} type="button" onClick={() => seleccionarProductor(productor)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#10281D] hover:bg-[#E4F1DD]">{productor.nombres} {productor.apellidos} · {productor.tipo_documento} {productor.numero_documento}</button>)}
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="actividad"
                            number="03"
                            title="Actividad productiva"
                            description="Información de la actividad productiva priorizada y secundaria."
                            icon={Leaf}
                            tone="leaf"
                        >
                            <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                <Field
                                    label="Línea productiva priorizada (extensión agropecuaria)"
                                    required
                                    className="md:col-span-4"
                                >
                                    <SelectField
                                        icon={Leaf}
                                        options={lineasProductivas.map((item) => ({ value: String(item.linea_productiva), label: String(item.nombre) }))}
                                        value={primaryLine}
                                        onValueChange={setPrimaryLine}
                                    />
                                </Field>
                                <Field
                                    label="Especie"
                                    required
                                    className="md:col-span-4"
                                >
                                    <SelectField icon={Layers} options={especiesProductivas.filter((item) => !primaryLine || String(item.linea_productiva) === primaryLine).map((item) => ({ value: String(item.especie_productiva), label: String(item.nombre) }))} />
                                </Field>
                                <Field
                                    label="Línea productiva secundaria"
                                    className="md:col-span-4"
                                >
                                    <SelectField icon={Leaf} options={lineasProductivas.map((item) => ({ value: String(item.linea_productiva), label: String(item.nombre) }))} />
                                </Field>
                                <Field
                                    label="Número de animales"
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={Hash}
                                        inputMode="numeric"
                                        placeholder="Ingrese el número de animales"
                                    />
                                </Field>
                                <Field
                                    label="Área destinada en la línea productiva priorizada (hectáreas)"
                                    required
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={Ruler}
                                        inputMode="decimal"
                                        placeholder="Ej. 0.00"
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        <div
                            id="poblacion"
                            className="grid items-start gap-[26px] min-[821px]:grid-cols-12"
                        >
                            <SectionCard
                                className="min-[821px]:col-span-7"
                                number="04"
                                title="Enfoque de población diferencial"
                                description="Condiciones y características de la población."
                                icon={UsersRound}
                                tone="coral"
                            >
                                <div className="flex flex-wrap gap-[10px]">
                                    {enfoquesPoblacionales.map((enfoque) => <CheckOption key={String(enfoque.enfoque_poblacional)} value={String(enfoque.enfoque_poblacional)}>{String(enfoque.nombre)}</CheckOption>)}
                                </div>
                                <div className="mt-[22px] border-t-2 border-dashed border-[#B5CAAE]" />
                                <div className="mt-[18px] grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <Field
                                        label="Tipo de discapacidad"
                                        className="md:col-span-6"
                                    >
                                        <SelectField options={[]} />
                                    </Field>
                                    <CheckOption name="victima_conflicto_armado" value="1" className="w-full rounded-[18px] md:col-span-6">
                                        Víctima del conflicto armado
                                    </CheckOption>
                                </div>
                            </SectionCard>

                            <SectionCard
                                id="afiliacion"
                                className="min-[821px]:col-span-5"
                                number="05"
                                title="Condiciones de afiliación"
                                description="Información sobre SISBEN y asociatividad."
                                icon={Landmark}
                                tone="yellow"
                            >
                                <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <div className="md:col-span-6">
                                        <FieldLabel required>
                                            ¿Está afiliado al SISBEN?
                                        </FieldLabel>
                                        <div className="inline-flex gap-1 rounded-[18px] border-[1.5px] border-[#B3C7AE] bg-[#E3EDDF] p-1">
                                            <RadioOption
                                                name="sisben"
                                                value="Sí"
                                                required
                                            />
                                            <RadioOption
                                                name="sisben"
                                                value="No"
                                            />
                                        </div>
                                    </div>
                                    <Field
                                        label="Puntaje"
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={Hash}
                                            placeholder="Ingrese el puntaje"
                                        />
                                    </Field>
                                    <div className="md:col-span-12">
                                        <FieldLabel required>
                                            ¿Está afiliado(a) en alguna
                                            asociación, cooperativa o gremio de
                                            productores agropecuarios legalmente
                                            constituida?
                                        </FieldLabel>
                                        <div className="inline-flex gap-1 rounded-[18px] border-[1.5px] border-[#B3C7AE] bg-[#E3EDDF] p-1">
                                            <RadioOption
                                                name="asociacion"
                                                value="Sí"
                                                required
                                            />
                                            <RadioOption
                                                name="asociacion"
                                                value="No"
                                            />
                                        </div>
                                    </div>
                                    <Field
                                        label="Nombre de la asociación, cooperativa o gremio"
                                        className="md:col-span-12"
                                    >
                                        <FieldControl
                                            icon={UsersRound}
                                            placeholder="Ingrese el nombre de la asociación, cooperativa o gremio"
                                        />
                                    </Field>
                                </div>
                            </SectionCard>
                        </div>

                        <SectionCard
                            id="visita"
                            number="06"
                            title="Objeto de la visita"
                            description="Aspecto y componente abordados en la visita."
                            icon={Target}
                            tone="green"
                        >
                            <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                <Field
                                    label="Nombre del aspecto objeto de la visita"
                                    required
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={Tag}
                                        placeholder="Ingrese el aspecto"
                                    />
                                </Field>
                                <Field
                                    label="Nombre del componente objeto de la visita"
                                    required
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={Layers}
                                        placeholder="Ingrese el componente"
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        <div
                            id="cierre"
                            className="grid items-start gap-[26px] min-[821px]:grid-cols-12"
                        >
                            <SectionCard
                                className="min-[821px]:col-span-6"
                                number="07"
                                title="Diagnóstico"
                                description="Describa el diagnóstico de la visita."
                                icon={ClipboardList}
                                tone="blue"
                            >
                                <TextAreaField
                                    name="diagnostico"
                                    rows={4}
                                    className="min-h-[200px]"
                                    placeholder="Ingrese el diagnóstico de la visita..."
                                />
                            </SectionCard>
                            <SectionCard
                                className="min-[821px]:col-span-6"
                                number="08"
                                title="Actividades realizadas"
                                description="Describa las actividades realizadas."
                                icon={ClipboardCheck}
                                tone="leaf"
                            >
                                <TextAreaField
                                    name="actividades_realizadas"
                                    rows={4}
                                    className="min-h-[200px]"
                                    placeholder="Ingrese las actividades realizadas..."
                                />
                            </SectionCard>
                        </div>

                        <div className="grid items-start gap-6 min-[821px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                            <SectionCard
                                className="self-start"
                                number="09"
                                title="Preguntas de identificación"
                                description="Conozca el entorno comercial y técnico del productor."
                                icon={MessageCircle}
                                tone="coral"
                            >
                                <div className="flex flex-col gap-[22px]">
                                    {[
                                        '¿Quiénes son los principales proveedores de servicios, insumos y equipos relacionados con su actividad productiva principal?',
                                        '¿Quiénes son los principales compradores de los productos de su actividad productiva principal?',
                                        '¿A quién le pregunta cuando tiene dudas sobre su sistema productivo?',
                                    ].map((question, index) => (
                                        <div
                                            key={question}
                                            className="flex gap-3.5"
                                        >
                                            <span className="mt-px flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#E4F1E5] text-[15px] font-bold text-[#186638]">
                                                {index + 1}
                                            </span>
                                            <Field
                                                label={question}
                                                name={['principales_proveedores', 'principales_compradores', 'fuentes_consulta'][index]}
                                                className="min-w-0 flex-1"
                                            >
                                                <FieldControl placeholder="Ingrese la respuesta…" />
                                            </Field>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                            <div className="flex flex-col gap-6 self-start">
                                <SectionCard
                                    number="10"
                                    title="Recomendaciones"
                                    description="Sugerencias técnicas para el productor."
                                    icon={Lightbulb}
                                    tone="yellow"
                                >
                                    <TextAreaField
                                        name="recomendaciones"
                                        rows={3}
                                        className="min-h-[140px]"
                                        placeholder="Ingrese las recomendaciones..."
                                    />
                                </SectionCard>
                                <SectionCard
                                    number="11"
                                    title="Compromisos para la próxima visita"
                                    description="Acuerdos entre el extensionista y el usuario."
                                    icon={Flag}
                                    tone="green"
                                >
                                    <TextAreaField
                                        name="compromisos"
                                        rows={3}
                                        className="min-h-[140px]"
                                        placeholder="Ingrese los compromisos..."
                                    />
                                </SectionCard>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <SectionCard
                                number="12"
                                title="Datos del extensionista"
                                description="Profesional que realiza la visita."
                                icon={GraduationCap}
                                tone="blue"
                            >
                                <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <Field
                                        label="Nombres y apellidos"
                                        required
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={UserRound}
                                            placeholder="Ingrese nombres y apellidos"
                                        />
                                    </Field>
                                    <Field
                                        label="Número de cédula"
                                        name="numero_documento_extensionista"
                                        required
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={FileText}
                                            placeholder="Ingrese el número de cédula"
                                        />
                                    </Field>
                                    <Field
                                        label="Disciplina"
                                        required
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={BookOpen}
                                            placeholder="Ingrese la disciplina"
                                        />
                                    </Field>
                                    <Field
                                        label="Título académico"
                                        required
                                        className="md:col-span-6"
                                    >
                                        <FieldControl
                                            icon={GraduationCap}
                                            placeholder="Ingrese el título académico"
                                        />
                                    </Field>
                                </div>
                                <div className="mt-3 max-w-sm">
                                    <Field
                                        label="Firma (extensionista)"
                                        required
                                    >
                                        <SignatureBox
                                            added={extensionistSignatureAdded}
                                            onAdd={() =>
                                                setExtensionistSignatureAdded(
                                                    (value) => !value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            </SectionCard>
                            <SectionCard
                                number="13"
                                title="Datos del usuario"
                                description="Firma de conformidad del productor."
                                icon={Pencil}
                                tone="green"
                            >
                                <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <Field
                                        label="Firma (usuario)"
                                        required
                                        className="md:col-span-7"
                                    >
                                        <SignatureBox
                                            className="h-[132px]"
                                            added={signatureAdded}
                                            onAdd={() =>
                                                setSignatureAdded(
                                                    (value) => !value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Número de cédula"
                                        name="numero_documento_usuario"
                                        required
                                        className="md:col-span-5"
                                    >
                                        <FieldControl
                                            icon={FileText}
                                            placeholder="Ingrese el número de cédula"
                                        />
                                    </Field>
                                </div>
                            </SectionCard>
                        </div>

                        <SectionCard
                            number="14"
                            title="Registro fotográfico"
                            description="Adjunta evidencias de la visita al predio. Campo obligatorio en SIGRA."
                            icon={Camera}
                            tone="yellow"
                        >
                            <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[24px] border-[2.5px] border-dashed border-[#4E9A2B] bg-[#F0F7EC] p-7 text-center text-[#10281D] transition hover:border-[#17803D] hover:bg-[#E4F1DD]">
                                <span className="flex size-[58px] items-center justify-center rounded-full bg-[#FFC933] text-[#3A2A00] shadow-[0_4px_0_#B78A0E]">
                                    <CloudUpload
                                        className="size-7"
                                        strokeWidth={2}
                                    />
                                </span>
                                <span className="text-[15.5px] font-extrabold">
                                    Seleccionar archivos o arrastrar aquí
                                </span>
                                <span className="text-[15px] text-[#3E5547]">
                                    Formatos: JPG, PNG. Máximo 5 MB por archivo.
                                </span>
                                <input
                                    type="file"
                                    name="fotografias[]"
                                    accept="image/jpeg,image/png"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="sr-only"
                                />
                            </label>
                            {visita?.fotografias && visita.fotografias.length > 0 && (
                                <div className="mt-3 rounded-[16px] border border-[#B5CAAE] bg-[#F7FBF4] p-4">
                                    <p className="text-sm font-bold text-[#10281D]">Fotografías existentes</p>
                                    <ul className="mt-2 list-inside list-disc text-sm text-[#3E5547]">
                                        {visita.fotografias.map((fotografia, indice) => <li key={`${fotografia.nombre ?? 'fotografia'}-${indice}`}>{fotografia.id ? <a className="font-semibold text-[#17803D] underline" href={`/visitas-extensionismo/${visita.id}/fotografias/${fotografia.id}`} target="_blank" rel="noreferrer">{fotografia.nombre ?? 'Fotografía adjunta'}</a> : (fotografia.nombre ?? 'Fotografía adjunta')}</li>)}
                                    </ul>
                                </div>
                            )}
                            {photoFiles.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {photoFiles.map((file) => (
                                        <span
                                            key={`${file.name}-${file.lastModified}`}
                                            className="inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-[#B5CAAE] bg-white px-4 pr-4 pl-2 text-[15px] font-extrabold text-[#10281D] shadow-[0_3px_0_rgba(14,59,42,0.14)]"
                                        >
                                            <span className="flex size-7 items-center justify-center rounded-full bg-[#FFC933] text-[#3A2A00]">
                                                <Camera className="size-3.5" />
                                            </span>
                                            {file.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-[1.5px] border-[#0E3B2A] bg-[#0E3B2A] px-7 py-5 shadow-[0_6px_0_#082519]">
                            <p className="text-[15px] text-[#D3E8D6]">
                                <i className="mr-0.5 text-[#FFC933]">*</i> Campo
                                obligatorio
                            </p>
                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGuardarBorrador}
                                    className="min-h-[50px] rounded-[18px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-7 text-[16px] font-extrabold text-[#10281D] hover:bg-[#E4F1DD]"
                                >
                                    <Save className="size-[18px]" />
                                    Guardar borrador
                                </Button>
                                <Button
                                    type="submit"
                                    className="min-h-[50px] rounded-[18px] bg-[#FFC933] px-7 text-[16px] font-extrabold text-[#3A2A00] shadow-[0_5px_0_#B78A0E] hover:bg-[#FFD653]"
                                >
                                    <Save className="size-[18px]" />
                                    Guardar visita
                                </Button>
                            </div>
                            {mensajeBorrador && (
                                <p
                                    role="status"
                                    className="basis-full text-sm font-semibold text-[#FFF2B2]"
                                >
                                    {mensajeBorrador}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

CrearVisitaExtensionismo.layout = {
    breadcrumbs: [
        {
            title: 'Visitas de extensionismo',
            href: crear(),
        },
        { title: 'Nueva visita', href: crear() },
    ],
};
