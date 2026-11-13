import { Head } from '@inertiajs/react';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement, useId, useRef, useState } from 'react';
import {
    AlertCircle,
    Beef,
    Bird,
    CalendarDays,
    ClipboardList,
    FileText,
    Fish,
    Footprints,
    Hash,
    Home,
    Landmark,
    Leaf,
    LocateFixed,
    MapPin,
    Phone,
    PiggyBank,
    Rabbit,
    Ruler,
    Save,
    Sprout,
    UserRound,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FormularioHeader } from '@/components/formulario-header';
import { FormularioSeccionesNav } from '@/components/formulario-secciones-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { crear as crearRoute, index } from '@/routes/registro-productor';
import {
    actividadesPostcosecha,
    edadesGanaderas,
    especiesAvicolas,
    especiesPiscicolas,
    etapasProduccionPorcina,
    instalaciones,
    opcionesSiNo,
    opcionesTipoCerca,
    opcionesTopografia,
    razasBovinas,
    razasOvinas,
    razasPorcinas,
    sistemasProduccionBovina,
    tiposComercializacionBovina,
    tiposExplotacion,
    tiposPoblacionDiferencial,
    destinosProduccion,
    cultivosInventario,
} from './datos-formulario';

type FormValue = string | string[];
type FormValues = Record<string, FormValue>;

const initialValues: FormValues = {};

type SectionTone = 'green' | 'blue' | 'leaf' | 'coral' | 'yellow';

const toneStyles: Record<SectionTone, string> = {
    green: 'bg-[#17803D] text-white shadow-[0_4px_0_#0E3B2A]',
    blue: 'bg-[#1B86B5] text-white shadow-[0_4px_0_#12668A]',
    leaf: 'bg-[#4E9A2B] text-white shadow-[0_4px_0_#34721D]',
    coral: 'bg-[#E0573F] text-white shadow-[0_4px_0_#A93426]',
    yellow: 'bg-[#FFC933] text-[#3A2A00] shadow-[0_4px_0_#B78A0E]',
};

const seccionesNavProductor = [
    {
        number: 1,
        label: 'Productor y predio',
        id: 'productor-predio',
        colorClass: 'bg-[#17803D] text-white',
    },
    {
        number: 2,
        label: 'Población diferencial',
        id: 'poblacion-diferencial',
        colorClass: 'bg-[#1B86B5] text-white',
    },
    {
        number: 3,
        label: 'Información del predio',
        id: 'informacion-predio',
        colorClass: 'bg-[#4E9A2B] text-white',
    },
    {
        number: 4,
        label: 'Ganadería bovina',
        id: 'ganaderia-bovina',
        colorClass: 'bg-[#E0573F] text-white',
    },
    {
        number: 5,
        label: 'Producción y manejo',
        id: 'produccion-manejo',
        colorClass: 'bg-[#FFC933] text-[#3A2A00]',
    },
    {
        number: 6,
        label: 'Instalaciones',
        id: 'instalaciones',
        colorClass: 'bg-[#17803D] text-white',
    },
    {
        number: 7,
        label: 'Inventario agropecuario',
        id: 'inventario-agropecuario',
        colorClass: 'bg-[#1B86B5] text-white',
    },
    {
        number: 8,
        label: 'Actividad agrícola',
        id: 'actividad-agricola',
        colorClass: 'bg-[#4E9A2B] text-white',
    },
    {
        number: 9,
        label: 'Cierre',
        id: 'productor-cierre',
        colorClass: 'bg-[#E0573F] text-white',
    },
] as const;

function SectionCard({
    number,
    title,
    description,
    icon: Icon,
    tone,
    id,
    children,
}: {
    number: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: SectionTone;
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
                        toneStyles[tone],
                    )}
                >
                    <Icon className="size-7" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#3E5547] dark:text-[#BFD9C5]">
                        Sección {number} de 8
                    </p>
                    <h2 className="mt-1 text-xl leading-tight font-extrabold tracking-[-0.02em] text-[#10281D] sm:text-[22px] dark:text-[#F0FFF3]">
                        {title}
                    </h2>
                    <p className="mt-1 text-[15px] leading-6 text-[#3E5547] dark:text-[#BFD9C5]">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

function Subcard({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[22px] border-[1.5px] border-[#D1E0CB] bg-[#F7FBF4] p-5 dark:border-[#3E5B46] dark:bg-[#22352A]">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    {Icon && (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#E4F1DD] text-[#17803D] dark:bg-[#294330] dark:text-[#A9D8AF]">
                            <Icon className="size-[18px]" strokeWidth={2} />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h3 className="text-[17px] font-extrabold text-[#103F2D] dark:text-[#F0FFF3]">
                            {title}
                        </h3>
                        {description && (
                            <p className="mt-1 text-sm leading-5 text-[#607665] dark:text-[#BFD9C5]">
                                {description}
                            </p>
                        )}
                    </div>
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
            className="mb-2.5 block text-[15px] leading-[1.4] font-semibold text-[#10281D] dark:text-[#E5F3E8]"
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
    className,
    children,
}: {
    label: ReactNode;
    required?: boolean;
    className?: string;
    children: ReactNode;
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
    icon: Icon,
    className,
    ...props
}: React.ComponentProps<typeof Input> & { icon?: LucideIcon }) {
    return (
        <div className="relative">
            {Icon && (
                <Icon className="pointer-events-none absolute top-1/2 left-[17px] z-10 size-5 -translate-y-1/2 text-[#2F6A45] dark:text-[#9DCEA8]" />
            )}
            <Input
                {...props}
                className={cn(
                    'h-[50px] rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] text-[16px] text-[#10281D] shadow-none placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus-visible:bg-[#294330]',
                    Icon && 'pl-[52px]',
                    className,
                )}
            />
        </div>
    );
}

function TextareaField({
    value,
    onChange,
    placeholder,
    rows = 4,
    id,
    name,
    'aria-labelledby': ariaLabelledby,
    'aria-required': ariaRequired,
    required,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
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
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="block min-h-[118px] w-full resize-y rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] py-3 text-[16px] leading-6 text-[#10281D] outline-none placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus:bg-[#294330]"
        />
    );
}

function CheckGrid({
    options,
    values,
    onToggle,
    columns = 'sm:grid-cols-2 lg:grid-cols-3',
    'aria-label': ariaLabel,
}: {
    options: readonly string[];
    values: string[];
    onToggle: (value: string) => void;
    columns?: string;
    'aria-label'?: string;
}) {
    return (
        <div
            role={ariaLabel ? 'group' : undefined}
            aria-label={ariaLabel}
            className={cn('grid gap-3', columns)}
        >
            {options.map((option) => {
                const checked = values.includes(option);

                return (
                    <label
                        key={option}
                        className={cn(
                            'flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] border-[#B5CAAE] bg-white px-3 py-2.5 text-[15px] font-semibold text-[#253D2E] transition hover:border-[#17803D] dark:border-[#3E5B46] dark:bg-[#1B2A21] dark:text-[#E5F3E8]',
                            checked &&
                                'border-[#17803D] bg-[#E4F1DD] text-[#103F2D] dark:bg-[#294330] dark:text-[#F0FFF3]',
                        )}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(option)}
                            className="size-4 accent-[#17803D]"
                        />
                        <span>{option}</span>
                    </label>
                );
            })}
        </div>
    );
}

function RadioGrid({
    options,
    value,
    onChange,
    columns = 'sm:grid-cols-2 lg:grid-cols-3',
    id,
    name,
    'aria-labelledby': ariaLabelledby,
    'aria-required': ariaRequired,
    'aria-label': ariaLabel,
    required,
}: {
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
    columns?: string;
    id?: string;
    name?: string;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
    required?: boolean;
}) {
    return (
        <div
            id={id}
            role="radiogroup"
            aria-labelledby={ariaLabelledby}
            aria-required={ariaRequired}
            aria-label={ariaLabel}
            className={cn('grid gap-3', columns)}
        >
            {options.map((option, index) => (
                <label
                    key={option}
                    className={cn(
                        'flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] border-[#B5CAAE] bg-white px-3 py-2.5 text-[15px] font-semibold text-[#253D2E] transition hover:border-[#17803D] dark:border-[#3E5B46] dark:bg-[#1B2A21] dark:text-[#E5F3E8]',
                        value === option &&
                            'border-[#17803D] bg-[#E4F1DD] text-[#103F2D] dark:bg-[#294330] dark:text-[#F0FFF3]',
                    )}
                >
                    <input
                        type="radio"
                        name={name}
                        required={required && index === 0}
                        checked={value === option}
                        onChange={() => onChange(option)}
                        className="size-4 accent-[#17803D]"
                    />
                    <span>{option}</span>
                </label>
            ))}
        </div>
    );
}

function NumberRows({
    rows,
    values,
    onChange,
    prefix,
    secondLabel = 'Número de animales',
}: {
    rows: readonly string[];
    values: (key: string) => string;
    onChange: (key: string, value: string) => void;
    prefix: string;
    secondLabel?: string;
}) {
    return (
        <div className="min-w-0 rounded-[16px] border-[1.5px] border-[#B5CAAE] dark:border-[#3E5B46]">
            <div>
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(170px,220px)] bg-[#E4F1DD] px-4 py-3 text-sm font-extrabold text-[#103F2D] md:grid dark:bg-[#294330] dark:text-[#F0FFF3]">
                    <span>Clasificación</span>
                    <span>{secondLabel}</span>
                </div>
                {rows.map((row) => (
                    <div
                        key={row}
                        className="grid min-w-0 gap-3 border-t border-[#D1E0CB] bg-white px-4 py-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(170px,220px)] md:items-center md:gap-4 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                    >
                        <span className="min-w-0 text-[15px] break-words text-[#253D2E] dark:text-[#E5F3E8]">
                            {row}
                        </span>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-[#3E5547] md:sr-only dark:text-[#BFD9C5]">
                                {secondLabel}
                            </span>
                            <Input
                                type="number"
                                min="0"
                                placeholder="Ingrese la cantidad"
                                aria-label={`${row}: ${secondLabel}`}
                                value={values(`${prefix}:${row}`)}
                                onChange={(event) =>
                                    onChange(
                                        `${prefix}:${row}`,
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full min-w-0 rounded-[12px] border-[#6F9479] bg-[#F7FBF4] placeholder:text-xs dark:border-[#5E8068] dark:bg-[#24382A]"
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DualNumberRows({
    rows,
    values,
    onChange,
    prefix,
}: {
    rows: readonly string[];
    values: (key: string) => string;
    onChange: (key: string, value: string) => void;
    prefix: string;
}) {
    return (
        <div className="min-w-0 rounded-[16px] border-[1.5px] border-[#B5CAAE] dark:border-[#3E5B46]">
            <div>
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(200px,240px)_minmax(200px,240px)] bg-[#E4F1DD] px-4 py-3 text-sm font-extrabold text-[#103F2D] md:grid dark:bg-[#294330] dark:text-[#F0FFF3]">
                    <span>Especie</span>
                    <span>Número de alevinos</span>
                    <span>Espejo de agua (m²)</span>
                </div>
                {rows.map((row) => (
                    <div
                        key={row}
                        className="grid min-w-0 gap-4 border-t border-[#D1E0CB] bg-white px-4 py-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(200px,240px)_minmax(200px,240px)] md:items-center dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                    >
                        <span className="min-w-0 text-[15px] break-words text-[#253D2E] dark:text-[#E5F3E8]">
                            {row}
                        </span>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-[#3E5547] dark:text-[#BFD9C5]">
                                Número de alevinos
                            </span>
                            <Input
                                type="number"
                                min="0"
                                placeholder="Ingrese la cantidad"
                                aria-label={`${row}: Número de alevinos`}
                                value={values(`${prefix}:${row}:alevinos`)}
                                onChange={(event) =>
                                    onChange(
                                        `${prefix}:${row}:alevinos`,
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full min-w-0 rounded-[12px] border-[#6F9479] bg-[#F7FBF4] placeholder:text-xs dark:border-[#5E8068] dark:bg-[#24382A]"
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-[#3E5547] dark:text-[#BFD9C5]">
                                Espejo de agua (m²)
                            </span>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Ingrese el área"
                                aria-label={`${row}: Espejo de agua (m²)`}
                                value={values(`${prefix}:${row}:espejo`)}
                                onChange={(event) =>
                                    onChange(
                                        `${prefix}:${row}:espejo`,
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full min-w-0 rounded-[12px] border-[#6F9479] bg-[#F7FBF4] placeholder:text-xs dark:border-[#5E8068] dark:bg-[#24382A]"
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CropInventory({
    values,
    onToggle,
}: {
    values: (key: string) => string[];
    onToggle: (key: string, value: string) => void;
}) {
    return (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {cultivosInventario.map((crop) => (
                <article
                    key={crop.id}
                    className="min-w-0 rounded-[16px] border-[1.5px] border-[#B5CAAE] bg-white p-4 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                >
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#E4F1DD] text-[#17803D] dark:bg-[#294330] dark:text-[#A9D8AF]">
                            <Sprout className="size-[18px]" strokeWidth={2} />
                        </span>
                        <p className="min-w-0 text-[15px] font-extrabold break-words text-[#253D2E] dark:text-[#E5F3E8]">
                            {crop.grupo && (
                                <span className="mr-1 text-[#17803D]">
                                    {crop.grupo} ·
                                </span>
                            )}
                            {crop.label}
                        </p>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {['Pan coger', 'Comercial'].map((column) => (
                            <label
                                key={column}
                                className="flex min-w-0 cursor-pointer items-center gap-2 rounded-[12px] border border-[#D1E0CB] px-3 py-2 text-sm font-semibold text-[#3E5547] transition hover:border-[#17803D] dark:border-[#3E5B46] dark:text-[#BFD9C5]"
                            >
                                <input
                                    type="checkbox"
                                    checked={values(
                                        `cultivo:${crop.id}`,
                                    ).includes(column)}
                                    onChange={() =>
                                        onToggle(`cultivo:${crop.id}`, column)
                                    }
                                    className="size-4 shrink-0 accent-[#17803D]"
                                />
                                <span className="min-w-0 break-words">
                                    {column}
                                </span>
                            </label>
                        ))}
                    </div>
                </article>
            ))}
        </div>
    );
}

export default function CrearRegistroProductor() {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [mensaje, setMensaje] = useState('');
    const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
    const [mensajeGeolocalizacion, setMensajeGeolocalizacion] = useState('');
    const coordenadasEditadasManualmente = useRef(false);

    const getString = (key: string) => {
        const value = values[key];

        return typeof value === 'string' ? value : '';
    };
    const getArray = (key: string) => {
        const value = values[key];

        return Array.isArray(value) ? value : [];
    };
    const setValue = (key: string, value: string | string[]) => {
        setValues((current) => ({ ...current, [key]: value }));
    };
    const toggleValue = (key: string, option: string) => {
        const current = getArray(key);
        setValue(
            key,
            current.includes(option)
                ? current.filter((value) => value !== option)
                : [...current, option],
        );
    };

    const obtenerUbicacion = () => {
        if (!navigator.geolocation) {
            setMensajeGeolocalizacion(
                'Este navegador no admite geolocalización. Puedes ingresar las coordenadas manualmente.',
            );
            return;
        }

        setObteniendoUbicacion(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (
                    !coordenadasEditadasManualmente.current ||
                    !getString('latitud') ||
                    !getString('longitud')
                ) {
                    setValue('latitud', position.coords.latitude.toFixed(6));
                    setValue('longitud', position.coords.longitude.toFixed(6));
                    setMensajeGeolocalizacion(
                        'Ubicación actualizada correctamente.',
                    );
                } else {
                    setMensajeGeolocalizacion(
                        'Se obtuvo la ubicación, pero se conservaron las coordenadas ingresadas manualmente.',
                    );
                }
                setObteniendoUbicacion(false);
            },
            (error) => {
                const messages: Record<number, string> = {
                    [error.PERMISSION_DENIED]:
                        'El permiso de ubicación fue denegado. Puedes ingresar las coordenadas manualmente.',
                    [error.POSITION_UNAVAILABLE]:
                        'La ubicación no está disponible en este momento. Puedes ingresar las coordenadas manualmente.',
                    [error.TIMEOUT]:
                        'La consulta de ubicación agotó el tiempo de espera. Puedes intentarlo nuevamente.',
                };
                setMensajeGeolocalizacion(
                    messages[error.code] ??
                        'No fue posible obtener la ubicación. Puedes ingresar las coordenadas manualmente.',
                );
                setObteniendoUbicacion(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMensaje(
            'El guardado del registro estará disponible cuando se integre la persistencia con PostgreSQL.',
        );
    };

    const handleGuardarBorrador = () => {
        setMensaje(
            'Guardar borrador estará disponible cuando se integre la persistencia con Laravel y PostgreSQL.',
        );
    };

    return (
        <>
            <Head title="Registro del productor" />
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
                        title="INVENTARIO Y CARACTERIZACIÓN DE PREDIOS PRODUCTIVOS AGROPECUARIOS"
                        description="Registra la información del productor y la caracterización de su predio agropecuario."
                        badges={[{ label: 'Nuevo registro', tone: 'accent' }]}
                    />

                    <FormularioSeccionesNav sections={seccionesNavProductor} />

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6"
                    >
                        <SectionCard
                            id="productor-predio"
                            number="1"
                            title="Información del productor y ubicación del predio"
                            description="Identificación, contacto y coordenadas editables del predio."
                            icon={UserRound}
                            tone="green"
                        >
                            <div className="flex flex-col gap-4">
                                <Subcard title="Identificación y contacto">
                                    <div className="grid gap-5 lg:grid-cols-3">
                                        <Field label="Nombre completo">
                                            <FieldControl
                                                icon={UserRound}
                                                value={getString(
                                                    'nombreCompleto',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'nombreCompleto',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Número de cédula">
                                            <FieldControl
                                                icon={FileText}
                                                value={getString(
                                                    'numeroCedula',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'numeroCedula',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Número de teléfono">
                                            <FieldControl
                                                icon={Phone}
                                                type="tel"
                                                value={getString('telefono')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'telefono',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </Subcard>
                                <Subcard title="Ubicación y georreferenciación">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <Field label="Corregimiento">
                                            <FieldControl
                                                icon={MapPin}
                                                value={getString(
                                                    'corregimiento',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'corregimiento',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Vereda">
                                            <FieldControl
                                                icon={MapPin}
                                                value={getString('vereda')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'vereda',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-5 flex flex-col gap-4 rounded-[16px] border border-dashed border-[#B5CAAE] p-4 dark:border-[#3E5B46]">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm font-extrabold text-[#103F2D] dark:text-[#F0FFF3]">
                                                Coordenadas
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={obtenerUbicacion}
                                                disabled={obteniendoUbicacion}
                                                className="min-h-11 rounded-[14px] bg-[#146E96] px-4 text-[15px] font-extrabold text-white shadow-[0_3px_0_#0D4E6B] hover:bg-[#0D5B7D] focus-visible:ring-[4px] focus-visible:ring-[#146E96]/35"
                                            >
                                                <LocateFixed className="size-5" />
                                                {obteniendoUbicacion
                                                    ? 'Obteniendo ubicación...'
                                                    : 'Usar mi ubicación actual'}
                                            </Button>
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <Field label="Longitud">
                                                <FieldControl
                                                    icon={MapPin}
                                                    inputMode="decimal"
                                                    placeholder="Ej. -72.395000"
                                                    value={getString(
                                                        'longitud',
                                                    )}
                                                    onChange={(event) => {
                                                        coordenadasEditadasManualmente.current = true;
                                                        setValue(
                                                            'longitud',
                                                            event.target.value,
                                                        );
                                                    }}
                                                />
                                            </Field>
                                            <Field label="Latitud">
                                                <FieldControl
                                                    icon={MapPin}
                                                    inputMode="decimal"
                                                    placeholder="Ej. 5.337900"
                                                    value={getString('latitud')}
                                                    onChange={(event) => {
                                                        coordenadasEditadasManualmente.current = true;
                                                        setValue(
                                                            'latitud',
                                                            event.target.value,
                                                        );
                                                    }}
                                                />
                                            </Field>
                                        </div>
                                        {mensajeGeolocalizacion && (
                                            <p className="text-sm text-[#3E5547] dark:text-[#BFD9C5]">
                                                {mensajeGeolocalizacion}
                                            </p>
                                        )}
                                    </div>
                                </Subcard>
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="poblacion-diferencial"
                            number="2"
                            title="Tipo de población diferencial"
                            description="Seleccione todas las condiciones que correspondan al productor."
                            icon={UsersRound}
                            tone="blue"
                        >
                            <CheckGrid
                                options={tiposPoblacionDiferencial}
                                values={getArray('poblacionDiferencial')}
                                onToggle={(option) =>
                                    toggleValue('poblacionDiferencial', option)
                                }
                                columns="sm:grid-cols-2 lg:grid-cols-4"
                            />
                        </SectionCard>

                        <SectionCard
                            id="informacion-predio"
                            number="3"
                            title="Información general del predio"
                            description="Identificación, áreas según uso y características físicas del predio."
                            icon={Home}
                            tone="leaf"
                        >
                            <div className="flex flex-col gap-4">
                                <Subcard title="Identificación y tenencia">
                                    <div className="grid gap-5 lg:grid-cols-3">
                                        <Field label="Nombre del predio">
                                            <FieldControl
                                                icon={Home}
                                                value={getString(
                                                    'nombrePredio',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'nombrePredio',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Hectáreas">
                                            <FieldControl
                                                icon={Ruler}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={getString('hectareas')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'hectareas',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Tenencia del predio">
                                            <FieldControl
                                                value={getString(
                                                    'tenenciaPredio',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'tenenciaPredio',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </Subcard>
                                <Subcard title="Áreas del predio según uso">
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        {[
                                            [
                                                'Área en sabana nativa (ha)',
                                                'areaSabanaNativa',
                                            ],
                                            ['Área en pasto (ha)', 'areaPasto'],
                                            [
                                                'Área en uso agrícola (ha)',
                                                'areaUsoAgricola',
                                            ],
                                            [
                                                'Área en bosque (ha)',
                                                'areaBosque',
                                            ],
                                        ].map(([label, key]) => (
                                            <Field key={key} label={label}>
                                                <FieldControl
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={getString(key)}
                                                    onChange={(event) =>
                                                        setValue(
                                                            key,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                        ))}
                                    </div>
                                </Subcard>
                                <Subcard title="Características físicas">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Altitud (m.s.n.m.)">
                                            <FieldControl
                                                type="number"
                                                min="0"
                                                value={getString('altitud')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'altitud',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <div>
                                            <FieldLabel>
                                                Topografía (%)
                                            </FieldLabel>
                                            <CheckGrid
                                                options={opcionesTopografia}
                                                values={getArray('topografia')}
                                                aria-label="Topografía (%)"
                                                onToggle={(option) =>
                                                    toggleValue(
                                                        'topografia',
                                                        option,
                                                    )
                                                }
                                                columns="sm:grid-cols-3"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-5">
                                        <FieldLabel>Tipo de cerca</FieldLabel>
                                        <CheckGrid
                                            options={opcionesTipoCerca}
                                            values={getArray('tipoCerca')}
                                            aria-label="Tipo de cerca"
                                            onToggle={(option) =>
                                                toggleValue('tipoCerca', option)
                                            }
                                            columns="sm:grid-cols-3"
                                        />
                                    </div>
                                </Subcard>
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="ganaderia-bovina"
                            number="4"
                            title="Información general — Ganadería bovina"
                            description="Caracterice el tipo de explotación, el sistema de producción y las razas o cruces."
                            icon={Sprout}
                            tone="coral"
                        >
                            <div className="flex flex-col gap-4">
                                <Subcard title="Tipo de explotación">
                                    <CheckGrid
                                        options={tiposExplotacion}
                                        values={getArray('tipoExplotacion')}
                                        onToggle={(option) =>
                                            toggleValue(
                                                'tipoExplotacion',
                                                option,
                                            )
                                        }
                                        columns="sm:grid-cols-2 lg:grid-cols-5"
                                    />
                                </Subcard>
                                <Subcard title="Sistema de producción">
                                    <CheckGrid
                                        options={sistemasProduccionBovina}
                                        values={getArray('sistemaProduccion')}
                                        onToggle={(option) =>
                                            toggleValue(
                                                'sistemaProduccion',
                                                option,
                                            )
                                        }
                                        columns="sm:grid-cols-3"
                                    />
                                </Subcard>
                                <Subcard title="Razas y/o cruces">
                                    <CheckGrid
                                        options={razasBovinas}
                                        values={getArray('razasBovinas')}
                                        onToggle={(option) =>
                                            toggleValue('razasBovinas', option)
                                        }
                                        columns="sm:grid-cols-2 lg:grid-cols-4"
                                    />
                                </Subcard>
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="produccion-manejo"
                            number="5"
                            title="Información de la producción y manejo — Ganadería bovina"
                            description="Registre comercialización, producción, destino, suplementación y asistencia técnica."
                            icon={Leaf}
                            tone="yellow"
                        >
                            <div className="flex flex-col gap-4">
                                <Subcard title="Comercializa">
                                    <CheckGrid
                                        options={tiposComercializacionBovina}
                                        values={getArray('comercializa')}
                                        onToggle={(option) =>
                                            toggleValue('comercializa', option)
                                        }
                                        columns="sm:grid-cols-2 lg:grid-cols-4"
                                    />
                                </Subcard>
                                <Subcard title="Producción de leche">
                                    <div className="grid gap-5 lg:grid-cols-3">
                                        <Field label="Ordeños/día">
                                            <FieldControl
                                                type="number"
                                                min="0"
                                                value={getString('ordenosDia')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'ordenosDia',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Animales ordeñados">
                                            <FieldControl
                                                type="number"
                                                min="0"
                                                value={getString(
                                                    'animalesOrdenados',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'animalesOrdenados',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Producción promedio/animal (lts/día)">
                                            <FieldControl
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={getString(
                                                    'produccionPromedio',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'produccionPromedio',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </Subcard>
                                <Subcard title="Destino">
                                    <CheckGrid
                                        options={destinosProduccion}
                                        values={getArray('destino')}
                                        onToggle={(option) =>
                                            toggleValue('destino', option)
                                        }
                                        columns="sm:grid-cols-2 lg:grid-cols-4"
                                    />
                                </Subcard>
                                <Subcard title="Suplementa y cuenta con asistencia técnica">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <div>
                                            <FieldLabel>Suplementa</FieldLabel>
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString('suplementa')}
                                                aria-label="Suplementa"
                                                onChange={(value) =>
                                                    setValue(
                                                        'suplementa',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                            <div className="mt-4">
                                                <Field label="¿Con qué?">
                                                    <FieldControl
                                                        value={getString(
                                                            'suplementoDescripcion',
                                                        )}
                                                        onChange={(event) =>
                                                            setValue(
                                                                'suplementoDescripcion',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                        <div>
                                            <FieldLabel>
                                                Cuenta con asistencia técnica
                                            </FieldLabel>
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'asistenciaGanadera',
                                                )}
                                                aria-label="Cuenta con asistencia técnica"
                                                onChange={(value) =>
                                                    setValue(
                                                        'asistenciaGanadera',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </div>
                                    </div>
                                </Subcard>
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="instalaciones"
                            number="6"
                            title="Instalaciones"
                            description="Marque con una X las instalaciones disponibles en el predio."
                            icon={Home}
                            tone="green"
                        >
                            <CheckGrid
                                options={instalaciones}
                                values={getArray('instalaciones')}
                                onToggle={(option) =>
                                    toggleValue('instalaciones', option)
                                }
                                columns="sm:grid-cols-2 lg:grid-cols-3"
                            />
                        </SectionCard>

                        <SectionCard
                            id="inventario-agropecuario"
                            number="7"
                            title="Inventario agropecuario"
                            description="Registre los cultivos, especies, razas y cantidades que correspondan al predio."
                            icon={ClipboardList}
                            tone="blue"
                        >
                            <div className="flex flex-col gap-4">
                                <Subcard
                                    title="Agrícola"
                                    description="Marque si cada cultivo es de pan coger o comercial."
                                    icon={Sprout}
                                >
                                    <CropInventory
                                        values={getArray}
                                        onToggle={toggleValue}
                                    />
                                </Subcard>
                                <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                                    <Subcard title="Bovino" icon={Beef}>
                                        <NumberRows
                                            rows={edadesGanaderas}
                                            prefix="bovino"
                                            values={getString}
                                            onChange={setValue}
                                        />
                                    </Subcard>
                                    <Subcard title="Equino" icon={Footprints}>
                                        <NumberRows
                                            rows={edadesGanaderas}
                                            prefix="equino"
                                            values={getString}
                                            onChange={setValue}
                                        />
                                    </Subcard>
                                </div>
                                <Subcard title="Piscícola" icon={Fish}>
                                    <DualNumberRows
                                        rows={especiesPiscicolas}
                                        prefix="piscicola"
                                        values={getString}
                                        onChange={setValue}
                                    />
                                    <div className="mt-4 grid min-w-0 gap-4 rounded-[16px] border-[1.5px] border-[#B5CAAE] bg-white p-4 md:grid-cols-[minmax(0,1fr)_minmax(200px,240px)_minmax(200px,240px)] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                                        <Field label="Otra especie">
                                            <FieldControl
                                                placeholder="Especifique la especie"
                                                value={getString(
                                                    'otraEspeciePiscicola',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'otraEspeciePiscicola',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <label className="flex min-w-0 flex-col gap-1.5">
                                            <span className="text-sm font-bold text-[#3E5547] dark:text-[#BFD9C5]">
                                                Número de alevinos
                                            </span>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Ingrese la cantidad"
                                                aria-label="Otra especie: Número de alevinos"
                                                value={getString(
                                                    'piscicola:Otra:alevinos',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'piscicola:Otra:alevinos',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-11 w-full min-w-0 rounded-[12px] border-[#6F9479] bg-[#F7FBF4] placeholder:text-xs dark:border-[#5E8068] dark:bg-[#24382A]"
                                            />
                                        </label>
                                        <label className="flex min-w-0 flex-col gap-1.5">
                                            <span className="text-sm font-bold text-[#3E5547] dark:text-[#BFD9C5]">
                                                Espejo de agua (m²)
                                            </span>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Ingrese el área"
                                                aria-label="Otra especie: Espejo de agua (m²)"
                                                value={getString(
                                                    'piscicola:Otra:espejo',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'piscicola:Otra:espejo',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-11 w-full min-w-0 rounded-[12px] border-[#6F9479] bg-[#F7FBF4] placeholder:text-xs dark:border-[#5E8068] dark:bg-[#24382A]"
                                            />
                                        </label>
                                    </div>
                                </Subcard>
                                <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                                    <Subcard title="Avícola" icon={Bird}>
                                        <NumberRows
                                            rows={especiesAvicolas}
                                            prefix="avicolas"
                                            values={getString}
                                            onChange={setValue}
                                        />
                                    </Subcard>
                                    <Subcard title="Porcino" icon={PiggyBank}>
                                        <FieldLabel>
                                            Raza (marque con una X)
                                        </FieldLabel>
                                        <CheckGrid
                                            options={razasPorcinas}
                                            values={getArray('razasPorcinas')}
                                            aria-label="Raza porcina"
                                            onToggle={(option) =>
                                                toggleValue(
                                                    'razasPorcinas',
                                                    option,
                                                )
                                            }
                                            columns="sm:grid-cols-2"
                                        />
                                        <div className="mt-5">
                                            <FieldLabel>
                                                Etapa de producción
                                            </FieldLabel>
                                            <NumberRows
                                                rows={etapasProduccionPorcina}
                                                prefix="porcino-etapa"
                                                values={getString}
                                                onChange={setValue}
                                            />
                                        </div>
                                    </Subcard>
                                    <Subcard title="Ovino" icon={Rabbit}>
                                        <FieldLabel>
                                            Raza (marque con una X)
                                        </FieldLabel>
                                        <CheckGrid
                                            options={razasOvinas}
                                            values={getArray('razasOvinas')}
                                            aria-label="Raza ovina"
                                            onToggle={(option) =>
                                                toggleValue(
                                                    'razasOvinas',
                                                    option,
                                                )
                                            }
                                            columns="sm:grid-cols-2"
                                        />
                                        <div className="mt-5">
                                            <NumberRows
                                                rows={['Hembras', 'Machos']}
                                                prefix="ovino-sexo"
                                                values={getString}
                                                onChange={setValue}
                                            />
                                        </div>
                                    </Subcard>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="actividad-agricola"
                            number="8"
                            title="Descripción de la actividad productiva agrícola principal"
                            description="Complete las características técnicas, de manejo, postcosecha, comercialización y limitantes."
                            icon={Leaf}
                            tone="leaf"
                        >
                            <div className="flex flex-col gap-4">
                                <Subcard title="Actividad y establecimiento">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Actividad agrícola principal">
                                            <FieldControl
                                                icon={Sprout}
                                                value={getString(
                                                    'actividadAgricolaPrincipal',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'actividadAgricolaPrincipal',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Tipo de sistema productivo">
                                            <FieldControl
                                                placeholder="Monocultivo, rotación, asociado, agroforestal"
                                                value={getString(
                                                    'tipoSistemaProductivo',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'tipoSistemaProductivo',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Densidad o distancia de siembra">
                                            <FieldControl
                                                value={getString(
                                                    'densidadSiembra',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'densidadSiembra',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Área sembrada o cantidad de plantas">
                                            <FieldControl
                                                value={getString('areaPlantas')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'areaPlantas',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Tipo o variedad de material vegetal"
                                            className="lg:col-span-2"
                                        >
                                            <FieldControl
                                                value={getString(
                                                    'materialVegetal',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'materialVegetal',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </Subcard>

                                <Subcard title="Manejo agronómico">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Fertilización — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'fertilizacion',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'fertilizacion',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Frecuencia de fertilización">
                                            <FieldControl
                                                value={getString(
                                                    'frecuenciaFertilizacion',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'frecuenciaFertilizacion',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Qué productos utiliza"
                                            className="lg:col-span-2"
                                        >
                                            <TextareaField
                                                value={getString(
                                                    'productosFertilizacion',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'productosFertilizacion',
                                                        value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                        <Field label="Control de arvenses — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'controlArvenses',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'controlArvenses',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Frecuencia de control">
                                            <FieldControl
                                                value={getString(
                                                    'frecuenciaArvenses',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'frecuenciaArvenses',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Tipo de control">
                                            <FieldControl
                                                placeholder="Manual, mecánica o química"
                                                value={getString(
                                                    'tipoControlArvenses',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'tipoControlArvenses',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Podas — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString('podas')}
                                                onChange={(value) =>
                                                    setValue('podas', value)
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Herramientas utilizadas">
                                            <FieldControl
                                                value={getString(
                                                    'herramientasPodas',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'herramientasPodas',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Plagas y enfermedades"
                                            className="lg:col-span-2"
                                        >
                                            <TextareaField
                                                value={getString(
                                                    'plagasEnfermedades',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'plagasEnfermedades',
                                                        value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                        <Field label="Control fitosanitario — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'controlFitosanitario',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'controlFitosanitario',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Frecuencia de control fitosanitario">
                                            <FieldControl
                                                value={getString(
                                                    'frecuenciaFitosanitario',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'frecuenciaFitosanitario',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Qué productos utiliza"
                                            className="lg:col-span-2"
                                        >
                                            <TextareaField
                                                value={getString(
                                                    'productosFitosanitario',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'productosFitosanitario',
                                                        value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                    </div>
                                </Subcard>

                                <Subcard title="Buenas prácticas y asistencia técnica">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Buenas prácticas agrícolas — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'buenasPracticas',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'buenasPracticas',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Registros">
                                            <FieldControl
                                                value={getString(
                                                    'registrosBPA',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'registrosBPA',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Análisis de suelos">
                                            <FieldControl
                                                value={getString(
                                                    'analisisSuelos',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'analisisSuelos',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Cuenta con asistencia técnica — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'asistenciaAgricola',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'asistenciaAgricola',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field
                                            label="Entidad"
                                            className="lg:col-span-2"
                                        >
                                            <FieldControl
                                                value={getString(
                                                    'entidadAsistencia',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'entidadAsistencia',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </Subcard>

                                <Subcard title="Riego">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Utiliza riego — ¿Sí o No?">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'utilizaRiego',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'utilizaRiego',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Qué tipo de sistema emplea">
                                            <FieldControl
                                                value={getString(
                                                    'tipoSistemaRiego',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'tipoSistemaRiego',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Con cuáles equipos de riego cuenta en su predio">
                                            <FieldControl
                                                value={getString(
                                                    'equiposRiego',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'equiposRiego',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Fuente de agua">
                                            <FieldControl
                                                value={getString('fuenteAgua')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'fuenteAgua',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Frecuencia o cada cuánto tiempo riega">
                                            <FieldControl
                                                value={getString(
                                                    'frecuenciaRiego',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'frecuenciaRiego',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Conoce algún tipo de riego">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString('conoceRiego')}
                                                onChange={(value) =>
                                                    setValue(
                                                        'conoceRiego',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field
                                            label="Está interesado en implementar riego"
                                            className="lg:col-span-2"
                                        >
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'interesRiego',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'interesRiego',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                    </div>
                                </Subcard>

                                <Subcard title="Maquinaria, equipos y herramientas agrícolas">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Maquinaria para preparación y siembra — Utiliza (Sí o No)">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'utilizaMaquinaria',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'utilizaMaquinaria',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Propia o alquilada">
                                            <FieldControl
                                                value={getString(
                                                    'propiedadMaquinaria',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'propiedadMaquinaria',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Tipo">
                                            <FieldControl
                                                value={getString(
                                                    'tipoMaquinaria',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'tipoMaquinaria',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Qué maquinaria requiere su explotación"
                                            className="lg:col-span-2"
                                        >
                                            <TextareaField
                                                value={getString(
                                                    'maquinariaRequerida',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'maquinariaRequerida',
                                                        value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Tipo de suelo, topografía o limitantes para la preparación"
                                            className="lg:col-span-2"
                                        >
                                            <TextareaField
                                                value={getString(
                                                    'limitantesPreparacion',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'limitantesPreparacion',
                                                        value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Equipos y herramientas (fumigadoras, estacionarias, herramienta menor, entre otras)"
                                            className="lg:col-span-2"
                                        >
                                            <TextareaField
                                                value={getString(
                                                    'equiposHerramientas',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'equiposHerramientas',
                                                        value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </Subcard>

                                <Subcard title="Postcosecha, mercadeo y comercialización">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <Field label="Cómo determina el momento óptimo de cosecha">
                                            <TextareaField
                                                value={getString(
                                                    'indiceCosecha',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'indiceCosecha',
                                                        value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                        <Field label="Método de cosecha">
                                            <TextareaField
                                                value={getString(
                                                    'metodoCosecha',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'metodoCosecha',
                                                        value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                        <Field label="Producción">
                                            <FieldControl
                                                value={getString('produccion')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'produccion',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Rendimiento">
                                            <FieldControl
                                                value={getString('rendimiento')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'rendimiento',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Cómo considera la calidad de su producto">
                                            <TextareaField
                                                value={getString(
                                                    'calidadProducto',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'calidadProducto',
                                                        value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                        <Field label="Porcentaje de pérdidas postcosecha estimado">
                                            <FieldControl
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={getString(
                                                    'perdidasPostcosecha',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'perdidasPostcosecha',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-5">
                                        <FieldLabel>
                                            Actividades postcosecha
                                        </FieldLabel>
                                        <CheckGrid
                                            options={actividadesPostcosecha}
                                            values={getArray(
                                                'actividadesPostcosecha',
                                            )}
                                            aria-label="Actividades postcosecha"
                                            onToggle={(option) =>
                                                toggleValue(
                                                    'actividadesPostcosecha',
                                                    option,
                                                )
                                            }
                                            columns="sm:grid-cols-2 lg:grid-cols-4"
                                        />
                                    </div>
                                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                        <Field label="A quién le vende su producto">
                                            <FieldControl
                                                value={getString(
                                                    'compradorProducto',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'compradorProducto',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="El producto es comercializado en finca">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'comercializadoFinca',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'comercializadoFinca',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Embalaje de venta">
                                            <FieldControl
                                                placeholder="Granel, canastillas, bolsas, otro"
                                                value={getString(
                                                    'embalajeVenta',
                                                )}
                                                onChange={(event) =>
                                                    setValue(
                                                        'embalajeVenta',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Almacena el producto">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'almacenaProducto',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'almacenaProducto',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                        <Field label="Precio de venta">
                                            <FieldControl
                                                value={getString('precioVenta')}
                                                onChange={(event) =>
                                                    setValue(
                                                        'precioVenta',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Pertenece a alguna asociación, federación o gremio">
                                            <RadioGrid
                                                options={opcionesSiNo}
                                                value={getString(
                                                    'perteneceAsociacion',
                                                )}
                                                onChange={(value) =>
                                                    setValue(
                                                        'perteneceAsociacion',
                                                        value,
                                                    )
                                                }
                                                columns="grid-cols-2"
                                            />
                                        </Field>
                                    </div>
                                </Subcard>

                                <Subcard title="Necesidades o limitantes">
                                    <Field label="Falencias, limitantes, debilidades y/o amenazas que afectan su explotación agrícola">
                                        <TextareaField
                                            value={getString(
                                                'necesidadesLimitantes',
                                            )}
                                            onChange={(value) =>
                                                setValue(
                                                    'necesidadesLimitantes',
                                                    value,
                                                )
                                            }
                                            rows={5}
                                        />
                                    </Field>
                                </Subcard>
                                <Subcard title="Observaciones">
                                    <TextareaField
                                        value={getString('observaciones')}
                                        onChange={(value) =>
                                            setValue('observaciones', value)
                                        }
                                        rows={6}
                                    />
                                </Subcard>
                            </div>
                        </SectionCard>

                        <section
                            id="productor-cierre"
                            className="scroll-mt-6 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                        >
                            <div className="mb-6 flex items-start gap-4 border-b-2 border-dashed border-[#B5CAAE] pb-5 dark:border-[#3E5B46]">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B86B5] text-white shadow-[0_4px_0_#12668A]">
                                    <Landmark className="size-7" />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-[#3E5547] dark:text-[#BFD9C5]">
                                        Cierre del registro
                                    </p>
                                    <h2 className="mt-1 text-xl font-extrabold text-[#10281D] sm:text-[22px] dark:text-[#F0FFF3]">
                                        Datos del profesional y firma
                                    </h2>
                                </div>
                            </div>
                            <div className="grid gap-5 lg:grid-cols-2">
                                <Field label="Fecha del registro">
                                    <FieldControl
                                        type="date"
                                        icon={CalendarDays}
                                        value={getString('fechaRegistro')}
                                        onChange={(event) =>
                                            setValue(
                                                'fechaRegistro',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Nombre del profesional y/o técnico de campo">
                                    <FieldControl
                                        icon={UserRound}
                                        value={getString('nombreProfesional')}
                                        onChange={(event) =>
                                            setValue(
                                                'nombreProfesional',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="C.C.">
                                    <FieldControl
                                        icon={FileText}
                                        value={getString('cedulaProfesional')}
                                        onChange={(event) =>
                                            setValue(
                                                'cedulaProfesional',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Celular">
                                    <FieldControl
                                        icon={Phone}
                                        type="tel"
                                        value={getString('celularProfesional')}
                                        onChange={(event) =>
                                            setValue(
                                                'celularProfesional',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <div className="rounded-[18px] border-[1.5px] border-dashed border-[#6F9479] bg-[#F7FBF4] p-5 lg:col-span-2 dark:border-[#5E8068] dark:bg-[#22352A]">
                                    <p className="text-sm font-extrabold text-[#103F2D] dark:text-[#F0FFF3]">
                                        Firma profesional y/o técnico de campo
                                        que realiza la visita
                                    </p>
                                    <div className="mt-8 h-14 border-b border-[#3E5547] dark:border-[#BFD9C5]" />
                                </div>
                            </div>
                            <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-[#607665] dark:text-[#BFD9C5]">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                La Alcaldía de Yopal, en cumplimiento de la ley
                                1581 de 2012 y su decreto reglamentario,
                                garantiza la seguridad y confidencialidad
                                respecto del tratamiento de los datos sensibles
                                o personales aquí consignados.
                                <a
                                    href="https://www.yopal-casanare.gov.co/tema/politicas-y-lineamientos/politica-de-tratamiento-de-datos-personales"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-1 font-semibold text-[#17803D] underline underline-offset-2 dark:text-[#A9D8AF]"
                                >
                                    Consultar política de tratamiento de datos
                                    personales.
                                </a>
                            </p>
                        </section>

                        <div className="flex flex-col gap-4 rounded-[28px] border-[1.5px] border-[#0E3B2A] bg-[#0E3B2A] px-5 py-5 shadow-[0_6px_0_#082519] sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div className="flex min-w-0 items-start gap-2 text-sm text-[#D3E8D6]">
                                <Hash className="mt-0.5 size-4 shrink-0 text-[#C8EA6B]" />
                                <p>
                                    MI10-F46 · Formulario frontend sin
                                    persistencia.
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
                            {mensaje && (
                                <p
                                    role="status"
                                    className="basis-full text-sm font-semibold text-[#FFF2B2]"
                                >
                                    {mensaje}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

CrearRegistroProductor.layout = {
    breadcrumbs: [
        { title: 'Registro del productor', href: index() },
        { title: 'Nuevo registro', href: crearRoute() },
    ],
};
