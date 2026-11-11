import { Head } from '@inertiajs/react';
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
import { crear } from '@/routes/visitas-extensionismo';
import { cn } from '@/lib/utils';

type SectionTone = 'green' | 'blue' | 'leaf' | 'coral' | 'yellow';

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
}: {
    label: ReactNode;
    required?: boolean;
    children: ReactNode;
    className?: string;
}) {
    const generatedId = `campo-${useId().replace(/:/g, '')}`;
    const labelId = `${generatedId}-label`;
    const accessibleChild = isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
              id: generatedId,
              name: generatedId,
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
    options: string[];
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
                    <option key={option} value={option}>
                        {option}
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
}: {
    children: ReactNode;
    className?: string;
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
    const [primaryLine, setPrimaryLine] = useState('');
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    const handleGuardarBorrador = () => {
        setMensajeBorrador(
            'Guardar borrador estará disponible cuando se integre la persistencia con Laravel y PostgreSQL.',
        );
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

                    <form
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
                                    <SelectField icon={MapPin} options={[]} />
                                </Field>
                                <Field
                                    label="Municipio"
                                    required
                                    className="md:col-span-5"
                                >
                                    <SelectField icon={MapPin} options={[]} />
                                </Field>
                                <Field
                                    label="Corregimiento"
                                    required
                                    className="md:col-span-6"
                                >
                                    <SelectField icon={MapPin} options={[]} />
                                </Field>
                                <Field
                                    label="Vereda"
                                    required
                                    className="md:col-span-6"
                                >
                                    <SelectField icon={MapPin} options={[]} />
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
                                    label="Nombre del usuario"
                                    required
                                    className="md:col-span-12"
                                >
                                    <FieldControl
                                        icon={UserRound}
                                        placeholder="Ingrese el nombre completo"
                                    />
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
                                        options={[]}
                                        value={primaryLine}
                                        onValueChange={setPrimaryLine}
                                    />
                                </Field>
                                <Field
                                    label="Especie"
                                    required
                                    className="md:col-span-4"
                                >
                                    <SelectField icon={Layers} options={[]} />
                                </Field>
                                <Field
                                    label="Línea productiva secundaria"
                                    className="md:col-span-4"
                                >
                                    <SelectField icon={Leaf} options={[]} />
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
                                    <CheckOption>Mujer rural</CheckOption>
                                    <CheckOption>
                                        Madre cabeza de hogar
                                    </CheckOption>
                                    <CheckOption>
                                        Adulto mayor (60 años o más)
                                    </CheckOption>
                                    <CheckOption>
                                        Adultez (29 a 59 años)
                                    </CheckOption>
                                    <CheckOption>
                                        Juventud (14 a 28 años)
                                    </CheckOption>
                                    <CheckOption>Afrocolombianos</CheckOption>
                                    <CheckOption>Rrom o gitano</CheckOption>
                                    <CheckOption>Raizales</CheckOption>
                                    <CheckOption>Indígenas</CheckOption>
                                    <CheckOption>Comunidad LGTBI</CheckOption>
                                    <CheckOption>Discapacidad</CheckOption>
                                    <CheckOption>Comunidad Negra</CheckOption>
                                </div>
                                <div className="mt-[22px] border-t-2 border-dashed border-[#B5CAAE]" />
                                <div className="mt-[18px] grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <Field
                                        label="Tipo de discapacidad"
                                        className="md:col-span-6"
                                    >
                                        <SelectField options={[]} />
                                    </Field>
                                    <CheckOption className="w-full rounded-[18px] md:col-span-6">
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
                                    accept="image/jpeg,image/png"
                                    multiple
                                    required
                                    onChange={handlePhotoChange}
                                    className="sr-only"
                                />
                            </label>
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
