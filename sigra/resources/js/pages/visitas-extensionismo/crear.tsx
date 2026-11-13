import { Head, router, setLayoutProps, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement, ReactNode } from 'react';
import {
    cloneElement,
    isValidElement,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    BookOpen,
    CalendarDays,
    Camera,
    Check,
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
import { FormularioSeccionesNav } from '@/components/formulario-secciones-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SigraSelect } from '@/components/ui/sigra-select';
import { crear, editar, index } from '@/routes/visitas-extensionismo';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SectionTone = 'green' | 'blue' | 'leaf' | 'coral' | 'yellow';

type Catalogo = { [key: string]: string | number };
type Predio = {
    predio: number;
    nombre: string;
    divipola?: number;
    corregimiento?: number;
    vereda?: number;
    latitud?: string;
    longitud?: string;
};
type ProductorEncontrado = {
    productor: number;
    nombres: string;
    apellidos: string;
    tipo_documento: string;
    numero_documento: string;
    telefono?: string | null;
    sexo?: string | null;
    predios: Predio[];
};
type LineaProductivaHistorica = {
    id: number;
    codigo: string;
    nombre: string;
};
type EstadoConsultaProductor =
    | 'inicial'
    | 'consultando'
    | 'encontrado'
    | 'no-encontrado'
    | 'error'
    | 'edicion';
type VisitaEdicion = {
    id: number;
    estado: string;
    campos: Record<string, string | number | boolean | null>;
    actividadHistorica?: {
        principal?: LineaProductivaHistorica | null;
        secundaria?: LineaProductivaHistorica | null;
    };
    productor?: ProductorEncontrado | null;
    nombres?: string;
    apellidos?: string;
    tipo_documento?: string;
    numero_documento?: string;
    telefono?: string;
    sexo?: string;
    productor_existente?: number;
    predio_existente?: number;
    nombre_predio?: string;
    divipola?: number;
    corregimiento?: number;
    vereda?: number;
    latitud?: string;
    longitud?: string;
    enfoques_poblacionales?: number[];
    fotografias?: Array<{ id?: number; nombre?: string }>;
};
type PageProps = {
    divipolas?: Catalogo[];
    corregimientos?: Catalogo[];
    veredas?: Catalogo[];
    lineasProductivas?: Catalogo[];
    especiesProductivas?: Catalogo[];
    enfoquesPoblacionales?: Catalogo[];
    visita?: VisitaEdicion;
};

type UnidadArea = 'areas' | 'hectareas';

const MENSAJE_ERROR_GUARDADO =
    'No fue posible guardar la visita. Revisa los errores indicados e inténtalo nuevamente';

const SECCION_POR_CAMPO: Record<string, { id: string; nombre: string }> = {
    productor_existente: { id: 'usuario', nombre: 'Caracterización del usuario' },
    nombres: { id: 'usuario', nombre: 'Caracterización del usuario' },
    apellidos: { id: 'usuario', nombre: 'Caracterización del usuario' },
    tipo_documento: { id: 'usuario', nombre: 'Caracterización del usuario' },
    numero_documento: { id: 'usuario', nombre: 'Caracterización del usuario' },
    telefono: { id: 'usuario', nombre: 'Caracterización del usuario' },
    sexo: { id: 'usuario', nombre: 'Caracterización del usuario' },
    predio_existente: { id: 'predio', nombre: 'Datos del predio' },
    nombre_predio: { id: 'predio', nombre: 'Datos del predio' },
    departamento: { id: 'predio', nombre: 'Datos del predio' },
    divipola: { id: 'predio', nombre: 'Datos del predio' },
    corregimiento: { id: 'predio', nombre: 'Datos del predio' },
    vereda: { id: 'predio', nombre: 'Datos del predio' },
    fecha_visita: { id: 'predio', nombre: 'Datos del predio' },
    latitud: { id: 'predio', nombre: 'Datos del predio' },
    longitud: { id: 'predio', nombre: 'Datos del predio' },
    linea_productiva_principal: { id: 'actividad', nombre: 'Actividad productiva' },
    linea_productiva_secundaria: { id: 'actividad', nombre: 'Actividad productiva' },
    especie_productiva: { id: 'actividad', nombre: 'Actividad productiva' },
    linea_productiva_principal_otra: { id: 'actividad', nombre: 'Actividad productiva' },
    especie_productiva_otra: { id: 'actividad', nombre: 'Actividad productiva' },
    linea_productiva_secundaria_otra: { id: 'actividad', nombre: 'Actividad productiva' },
    numero_animales: { id: 'actividad', nombre: 'Actividad productiva' },
    area_valor_ingresado: { id: 'actividad', nombre: 'Actividad productiva' },
    area_hectareas: { id: 'actividad', nombre: 'Actividad productiva' },
    unidad_area_ingresada: { id: 'actividad', nombre: 'Actividad productiva' },
    tipo_discapacidad: { id: 'poblacion', nombre: 'Enfoque de población diferencial' },
    victima_conflicto_armado: { id: 'poblacion', nombre: 'Enfoque de población diferencial' },
    enfoques_poblacionales: { id: 'poblacion', nombre: 'Enfoque de población diferencial' },
    afiliado_sisben: { id: 'afiliacion', nombre: 'Condiciones de afiliación' },
    sisben: { id: 'afiliacion', nombre: 'Condiciones de afiliación' },
    puntaje_sisben: { id: 'afiliacion', nombre: 'Condiciones de afiliación' },
    afiliado_asociacion: { id: 'afiliacion', nombre: 'Condiciones de afiliación' },
    asociacion: { id: 'afiliacion', nombre: 'Condiciones de afiliación' },
    nombre_asociacion: { id: 'afiliacion', nombre: 'Condiciones de afiliación' },
    aspecto_visita: { id: 'visita', nombre: 'Objeto de la visita' },
    componente_visita: { id: 'visita', nombre: 'Objeto de la visita' },
    diagnostico: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    actividades_realizadas: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    principales_proveedores: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    principales_compradores: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    fuentes_consulta: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    recomendaciones: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    compromisos: { id: 'cierre', nombre: 'Diagnóstico y cierre' },
    nombre_extensionista: { id: 'cierre', nombre: 'Datos del extensionista' },
    numero_documento_extensionista: { id: 'cierre', nombre: 'Datos del extensionista' },
    disciplina_extensionista: { id: 'cierre', nombre: 'Datos del extensionista' },
    titulo_academico_extensionista: { id: 'cierre', nombre: 'Datos del extensionista' },
    fotografias: { id: 'cierre', nombre: 'Registro fotográfico' },
};

const ETIQUETA_CAMPO: Record<string, string> = {
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
    nombre_predio: 'Nombre del predio',
    departamento: 'Departamento',
    divipola: 'Municipio',
    corregimiento: 'Corregimiento',
    vereda: 'Vereda',
    fecha_visita: 'Fecha de visita',
    linea_productiva_principal: 'Línea productiva principal',
    especie_productiva: 'Especie productiva',
    area_valor_ingresado: 'Área',
    latitud: 'Latitud',
    longitud: 'Longitud',
    diagnostico: 'Diagnóstico',
    actividades_realizadas: 'Actividades realizadas',
    recomendaciones: 'Recomendaciones',
    compromisos: 'Compromisos',
};

function campoBase(campo: string): string {
    return campo.replace(/\.\d+$/, '');
}

const seccionesVisita = [
    {
        number: 1,
        label: 'Usuario',
        id: 'usuario',
        colorClass: 'bg-[#17803D] text-white',
    },
    {
        number: 2,
        label: 'Predio',
        id: 'predio',
        colorClass: 'bg-[#1B86B5] text-white',
    },
    {
        number: 3,
        label: 'Actividad',
        id: 'actividad',
        colorClass: 'bg-[#4E9A2B] text-white',
    },
    {
        number: 4,
        label: 'Población',
        id: 'poblacion',
        colorClass: 'bg-[#E0573F] text-white',
    },
    {
        number: 5,
        label: 'Afiliación',
        id: 'afiliacion',
        colorClass: 'bg-[#FFC933] text-[#3A2A00]',
    },
    {
        number: 6,
        label: 'Visita',
        id: 'visita',
        colorClass: 'bg-[#17803D] text-white',
    },
    {
        number: 7,
        label: 'Cierre',
        id: 'cierre',
        colorClass: 'bg-[#1B86B5] text-white',
    },
] as const;

function normalizarValorSuperficie(valor: string): string {
    const limpio = valor.trim().replaceAll(' ', '');

    if (limpio.includes(',')) {
        return limpio.replaceAll('.', '').replace(',', '.');
    }

    return limpio;
}

function moverDecimal(valor: string, posiciones: number): string {
    const normalizado = normalizarValorSuperficie(valor);
    if (!/^\d*(?:\.\d*)?$/.test(normalizado) || normalizado === '') {
        return valor;
    }

    const [entero = '0', decimal = ''] = normalizado.split('.');
    const digitos = `${entero}${decimal}`.replace(/^0+(?=\d)/, '') || '0';
    const posicion = entero.length + posiciones;
    let resultado: string;

    if (posicion <= 0) {
        resultado = `0.${'0'.repeat(-posicion)}${digitos}`;
    } else if (posicion >= digitos.length) {
        resultado = `${digitos}${'0'.repeat(posicion - digitos.length)}`;
    } else {
        resultado = `${digitos.slice(0, posicion)}.${digitos.slice(posicion)}`;
    }

    return resultado.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function formatearSuperficie(valor: string): string {
    const normalizado = normalizarValorSuperficie(valor);
    if (!/^\d+(?:\.\d+)?$/.test(normalizado)) {
        return '';
    }

    const [entero, decimal] = normalizado.split('.');
    const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const decimalVisible = decimal?.replace(/0+$/, '');

    return decimalVisible ? `${miles},${decimalVisible}` : miles;
}

const nombresCampos: Record<string, string> = {
    Fecha: 'fecha_visita',
    Departamento: 'departamento',
    Municipio: 'divipola',
    Corregimiento: 'corregimiento',
    Vereda: 'vereda',
    'Nombre del predio': 'nombre_predio',
    Latitud: 'latitud',
    Longitud: 'longitud',
    Nombres: 'nombres',
    Apellidos: 'apellidos',
    'Número de cédula': 'numero_documento',
    'Número de celular': 'telefono',
    'Línea productiva priorizada (extensión agropecuaria)':
        'linea_productiva_principal',
    Especie: 'especie_productiva',
    'Línea productiva secundaria': 'linea_productiva_secundaria',
    'Número de animales': 'numero_animales',
    'Área destinada en la línea productiva priorizada (hectáreas)':
        'area_hectareas',
    'Tipo de discapacidad': 'tipo_discapacidad',
    Puntaje: 'puntaje_sisben',
    'Nombre de la asociación, cooperativa o gremio': 'nombre_asociacion',
    'Nombre del aspecto objeto de la visita': 'aspecto_visita',
    'Nombre del componente objeto de la visita': 'componente_visita',
    Diagnóstico: 'diagnostico',
    'Actividades realizadas': 'actividades_realizadas',
    Recomendaciones: 'recomendaciones',
    'Compromisos para la próxima visita': 'compromisos',
    'Nombres y apellidos': 'nombre_extensionista',
    Disciplina: 'disciplina_extensionista',
    'Título académico': 'titulo_academico_extensionista',
    'Firma (usuario)': 'firma_usuario',
    'Firma (extensionista)': 'firma_extensionista',
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
    const nombreDelHijo = isValidElement(children)
        ? (children as ReactElement<Record<string, unknown>>).props.name
        : undefined;
    const accessibleChild = isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
              id: generatedId,
              name:
                  name ??
                  (typeof nombreDelHijo === 'string'
                      ? nombreDelHijo
                      : typeof label === 'string'
                        ? (nombresCampos[label] ?? generatedId)
                        : generatedId),
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

const SelectField = SigraSelect;

function TextAreaField({
    placeholder,
    rows = 3,
    className,
    id,
    name,
    value,
    onChange,
    'aria-labelledby': ariaLabelledby,
    'aria-required': ariaRequired,
    required,
}: {
    placeholder: string;
    rows?: number;
    className?: string;
    id?: string;
    name?: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    required?: boolean;
}) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const ajustarAltura = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(textarea.scrollHeight, 140)}px`;
    };

    useEffect(() => {
        if (textareaRef.current) ajustarAltura(textareaRef.current);
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            id={id}
            name={name}
            value={value}
            aria-labelledby={ariaLabelledby}
            aria-required={ariaRequired}
            required={required}
            rows={rows}
            placeholder={placeholder}
            onInput={(event) => ajustarAltura(event.currentTarget)}
            onChange={(event) => {
                ajustarAltura(event.currentTarget);
                onChange?.(event);
            }}
            className={cn(
                'block min-h-[140px] w-full resize-none overflow-hidden rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] py-4 text-[16px] leading-[1.5] text-[#10281D] outline-none placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30',
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
                name={
                    name ??
                    (typeof children === 'string' &&
                    children === 'Víctima del conflicto armado'
                        ? 'victima_conflicto_armado'
                        : 'enfoques_poblacionales[]')
                }
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
    label = value,
    required = false,
}: {
    name: string;
    value: string;
    label?: string;
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
                {label}
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
    const {
        divipolas = [],
        corregimientos = [],
        veredas = [],
        lineasProductivas = [],
        especiesProductivas = [],
        enfoquesPoblacionales = [],
        visita,
    } = usePage<PageProps>().props;

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                {
                    title: 'Visitas de extensionismo',
                    href: index.url(),
                },
                {
                    title: visita ? 'Editar visita' : 'Nueva visita',
                    href: visita ? editar.url(visita.id) : crear.url(),
                },
            ],
        });
    }, [visita]);

    const formularioRef = useRef<HTMLFormElement | null>(null);
    const divipolaInicial = String(visita?.divipola ?? '');
    const predioTieneUbicacion = divipolaInicial !== '' || Boolean(visita?.predio_existente);
    const departamentoInicial = visita
        && predioTieneUbicacion
        ? String(
              divipolas.find(
                  (item) => String(item.divipola) === divipolaInicial,
              )?.codigo_departamento ?? '',
          )
        : '85';
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(
        departamentoInicial,
    );
    const [divipolaSeleccionada, setDivipolaSeleccionada] = useState(
        divipolaInicial,
    );
    const [corregimientoSeleccionado, setCorregimientoSeleccionado] =
        useState(String(visita?.corregimiento ?? ''));
    const [veredaSeleccionada, setVeredaSeleccionada] = useState(
        String(visita?.vereda ?? ''),
    );
    const [nombrePredio, setNombrePredio] = useState(
        String(visita?.nombre_predio ?? ''),
    );
    const [lineaPrincipalHistorica, setLineaPrincipalHistorica] =
        useState<LineaProductivaHistorica | null>(
            visita?.actividadHistorica?.principal ?? null,
        );
    const [lineaSecundariaHistorica, setLineaSecundariaHistorica] =
        useState<LineaProductivaHistorica | null>(
            visita?.actividadHistorica?.secundaria ?? null,
        );
    const [primaryLine, setPrimaryLine] = useState(
        visita?.actividadHistorica?.principal
            ? ''
            : String(visita?.campos.linea_productiva_principal ?? ''),
    );
    const [secondaryLine, setSecondaryLine] = useState(
        visita?.actividadHistorica?.secundaria
            ? ''
            : String(visita?.campos.linea_productiva_secundaria ?? ''),
    );
    const [species, setSpecies] = useState(
        visita?.actividadHistorica?.principal
            ? ''
            : String(visita?.campos.especie_productiva ?? ''),
    );
    const [speciesOther, setSpeciesOther] = useState(
        String(visita?.campos.especie_productiva_otra ?? ''),
    );
    const [tipoDiscapacidad, setTipoDiscapacidad] = useState(
        visita ? String(visita.campos.tipo_discapacidad ?? '') : 'Ninguna',
    );
    const [unidadArea, setUnidadArea] = useState<UnidadArea>(
        visita?.campos.unidad_area_ingresada === 'areas'
            ? 'areas'
            : 'hectareas',
    );
    const [valorArea, setValorArea] = useState(() => {
        const hectareas = String(visita?.campos.area_hectareas ?? '');

        return visita?.campos.unidad_area_ingresada === 'areas'
            ? moverDecimal(hectareas, 2)
            : hectareas;
    });
    const [productorSeleccionado, setProductorSeleccionado] =
        useState<ProductorEncontrado | null>(visita?.productor ?? null);
    const [resultadosProductor, setResultadosProductor] = useState<
        ProductorEncontrado[]
    >([]);
    const [buscandoProductor, setBuscandoProductor] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [estadoConsultaProductor, setEstadoConsultaProductor] =
        useState<EstadoConsultaProductor>(
            visita?.productor ? 'edicion' : 'inicial',
        );
    const [predioExistente, setPredioExistente] = useState(
        String(visita?.predio_existente ?? ''),
    );
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [fotoVisor, setFotoVisor] = useState<number | null>(null);
    const [zoomFoto, setZoomFoto] = useState(1);
    const visitaId = visita?.id;
    const fotografiasVisor = useMemo(
        () => [
            ...(visita?.fotografias ?? []).map((fotografia) => ({
                nombre: fotografia.nombre ?? 'Fotografía adjunta',
                src: fotografia.id
                    ? `/visitas-extensionismo/${visitaId}/fotografias/${fotografia.id}`
                    : '',
                id: fotografia.id,
            })),
            ...photoFiles.map((file) => ({
                nombre: file.name,
                src: URL.createObjectURL(file),
            })),
        ],
        [photoFiles, visitaId, visita?.fotografias],
    );
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
    const [erroresGuardado, setErroresGuardado] = useState<
        Record<string, string>
    >({});
    const [guardando, setGuardando] = useState(false);
    const solicitudAutomaticaRealizadaRef = useRef(false);
    const coordenadasEditadasManualmenteRef = useRef(false);
    const consultaProductorRef = useRef<AbortController | null>(null);
    const secuenciaConsultaProductorRef = useRef(0);
    const temporizadorConsultaProductorRef = useRef<number | null>(null);
    const identidadProductorModificadaRef = useRef(false);
    const hidratandoEdicionRef = useRef(false);
    const guardandoRef = useRef(false);

    const lineasProductivasPermitidas = lineasProductivas.filter((linea) =>
        ['AGRICOLA', 'PECUARIO'].includes(String(linea.codigo)),
    );
    const municipiosVisibles = divipolas.filter(
        (item) =>
            String(item.codigo_departamento) === departamentoSeleccionado,
    );
    const corregimientosVisibles = corregimientos.filter(
        (item) => String(item.divipola) === divipolaSeleccionada,
    );
    const veredasVisibles = veredas.filter(
        (item) => String(item.corregimiento) === corregimientoSeleccionado,
    );
    const lineaPrincipal = lineasProductivasPermitidas.find(
        (linea) => String(linea.linea_productiva) === primaryLine,
    );
    const categoriaPrincipal = String(lineaPrincipal?.codigo ?? '');
    const lineaSecundaria = lineasProductivasPermitidas.find(
        (linea) => String(linea.linea_productiva) === secondaryLine,
    );
    const categoriaSecundaria = String(lineaSecundaria?.codigo ?? '');
    const especiesVisibles = especiesProductivas
        .filter(
            (item) => String(item.linea_productiva) === primaryLine,
        )
        .sort((a, b) => {
            const orden = ['general', 'frutal', 'citrico', 'otra', 'pecuario'];
            return (
                orden.indexOf(String(a.grupo)) -
                orden.indexOf(String(b.grupo))
            );
        });
    const especieSeleccionada = especiesVisibles.find(
        (item) => String(item.especie_productiva) === species,
    );
    const especieEsOtra = String(especieSeleccionada?.codigo ?? '').startsWith(
        'MI10_OTRA_',
    );
    const etiquetaGrupoEspecie: Record<string, string> = {
        general: 'Cultivos generales',
        frutal: 'Frutales',
        citrico: 'Cítricos',
        otra: 'Otras opciones',
    };

    const cambiarLineaPrincipal = (valor: string) => {
        const especieSigueSiendoValida = especiesProductivas.some(
            (item) =>
                String(item.linea_productiva) === valor &&
                String(item.especie_productiva) === species,
        );

        setLineaPrincipalHistorica(null);
        setPrimaryLine(valor);
        if (!especieSigueSiendoValida) {
            setSpecies('');
        }
        setSpeciesOther('');
    };

    const cambiarLineaSecundaria = (valor: string) => {
        setLineaSecundariaHistorica(null);
        setSecondaryLine(valor);
    };

    useEffect(() => {
        if (!visita || !formularioRef.current) return;
        hidratandoEdicionRef.current = true;
        const valores: Record<string, unknown> = {
            ...visita.campos,
            nombres: visita.nombres,
            apellidos: visita.apellidos,
            tipo_documento: visita.tipo_documento,
            numero_documento: visita.numero_documento,
            telefono: visita.telefono,
            sexo: visita.sexo,
            productor_existente: visita.productor_existente,
            predio_existente: visita.predio_existente,
            sisben: visita.campos.afiliado_sisben,
            asociacion: visita.campos.afiliado_asociacion,
        };
        Object.entries(valores).forEach(([nombre, valor]) => {
            if (valor === null || valor === undefined) return;
            const controles = Array.from(
                formularioRef.current?.querySelectorAll<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >(`[name="${nombre}"]`) ?? [],
            );
            const valorTexto =
                nombre === 'fecha_visita'
                    ? String(valor as string | number | boolean).slice(0, 10)
                    : String(valor as string | number | boolean);
            controles.forEach((control) => {
                if (
                    control instanceof HTMLInputElement &&
                    (control.type === 'radio' || control.type === 'checkbox')
                ) {
                    const valorBooleano =
                        valor === true ||
                        valorTexto.toUpperCase() === 'S' ||
                        valorTexto === '1' ||
                        valorTexto === 'true';
                    control.checked =
                        control.value === valorTexto ||
                        (control.type === 'radio' &&
                            (valorBooleano
                                ? control.value === 'S'
                                : control.value === 'N')) ||
                        (control.type === 'checkbox' && valorBooleano);
                } else {
                    control.value = valorTexto;
                    control.dispatchEvent(
                        new Event('change', { bubbles: true }),
                    );
                }
            });
        });
        const divipolaEditada = String(visita.divipola ?? '');
        const municipioEditado = divipolas.find(
            (item) => String(item.divipola) === divipolaEditada,
        );
        setDepartamentoSeleccionado(
            String(
                municipioEditado?.codigo_departamento ??
                    (visita.predio_existente ? '' : '85'),
            ),
        );
        setDivipolaSeleccionada(divipolaEditada);
        setCorregimientoSeleccionado(String(visita.corregimiento ?? ''));
        setVeredaSeleccionada(String(visita.vereda ?? ''));
        setNombrePredio(String(visita.nombre_predio ?? ''));
        setPredioExistente(String(visita.predio_existente ?? ''));
        setLatitud(String(visita.latitud ?? ''));
        setLongitud(String(visita.longitud ?? ''));
        setLineaPrincipalHistorica(
            visita.actividadHistorica?.principal ?? null,
        );
        setPrimaryLine(
            visita.actividadHistorica?.principal
                ? ''
                : String(visita.campos.linea_productiva_principal ?? ''),
        );
        setSecondaryLine(
            visita.actividadHistorica?.secundaria
                ? ''
                : String(visita.campos.linea_productiva_secundaria ?? ''),
        );
        setLineaSecundariaHistorica(
            visita.actividadHistorica?.secundaria ?? null,
        );
        setSpecies(
            visita.actividadHistorica?.principal
                ? ''
                : String(visita.campos.especie_productiva ?? ''),
        );
        setSpeciesOther(String(visita.campos.especie_productiva_otra ?? ''));
        setTipoDiscapacidad(String(visita.campos.tipo_discapacidad ?? ''));
        const unidad =
            visita.campos.unidad_area_ingresada === 'areas'
                ? 'areas'
                : 'hectareas';
        const hectareas = String(visita.campos.area_hectareas ?? '');
        setUnidadArea(unidad);
        setValorArea(
            unidad === 'areas' ? moverDecimal(hectareas, 2) : hectareas,
        );
        setProductorSeleccionado(visita.productor ?? null);
        setEstadoConsultaProductor(visita.productor ? 'edicion' : 'inicial');
        visita.enfoques_poblacionales?.forEach((id) => {
            const control =
                formularioRef.current?.querySelector<HTMLInputElement>(
                    `input[name="enfoques_poblacionales[]"][value="${id}"]`,
                );
            if (control) control.checked = true;
        });
        hidratandoEdicionRef.current = false;
    }, [visita]);

    const valorCampo = (nombre: string): string => {
        const control = formularioRef.current?.elements.namedItem(nombre) as
            | HTMLInputElement
            | HTMLSelectElement
            | null;

        return control?.value ?? '';
    };

    const limpiarDatosPredio = () => {
        setDepartamentoSeleccionado('85');
        setDivipolaSeleccionada('');
        setCorregimientoSeleccionado('');
        setVeredaSeleccionada('');
        setNombrePredio('');
        setLatitud('');
        setLongitud('');
    };

    const cambiarIdentidadProductor = (
        tipoDocumento: string,
        numeroDocumento: string,
    ) => {
        if (hidratandoEdicionRef.current) return;
        identidadProductorModificadaRef.current = true;
        setProductorSeleccionado(null);
        setPredioExistente('');
        limpiarDatosPredio();
        buscarProductor(tipoDocumento, numeroDocumento);
    };

    const buscarProductor = (
        tipoDocumento: string,
        numeroDocumento: string,
    ) => {
        const tipo = tipoDocumento.trim();
        const numero = numeroDocumento.trim();
        if (temporizadorConsultaProductorRef.current !== null) {
            window.clearTimeout(temporizadorConsultaProductorRef.current);
        }
        consultaProductorRef.current?.abort();
        setResultadosProductor([]);
        setErrorBusqueda('');
        setEstadoConsultaProductor('inicial');
        if (tipo === '' || numero.length < 3) {
            setBuscandoProductor(false);
            return;
        }

        const controlador = new AbortController();
        consultaProductorRef.current = controlador;
        const secuencia = ++secuenciaConsultaProductorRef.current;
        setBuscandoProductor(true);
        setEstadoConsultaProductor('consultando');
        temporizadorConsultaProductorRef.current = window.setTimeout(
            () =>
                fetch(
                    `/visitas-extensionismo/productores?tipo_documento=${encodeURIComponent(tipo)}&numero_documento=${encodeURIComponent(numero)}`,
                    {
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        signal: controlador.signal,
                    },
                )
                    .then(async (respuesta) => {
                        const contenido =
                            respuesta.headers.get('content-type') ?? '';
                        if (
                            !respuesta.ok ||
                            !contenido.includes('application/json')
                        ) {
                            throw new Error('respuesta-no-json');
                        }
                        const resultados = (await respuesta.json()) as unknown;
                        if (!Array.isArray(resultados)) {
                            throw new Error('respuesta-invalida');
                        }

                        return resultados as ProductorEncontrado[];
                    })
                    .then((resultados) => {
                        if (secuencia !== secuenciaConsultaProductorRef.current)
                            return;
                        setResultadosProductor(resultados);
                        if (resultados.length === 1) {
                            seleccionarProductor(resultados[0]);
                            setEstadoConsultaProductor('encontrado');
                        } else {
                            setEstadoConsultaProductor('no-encontrado');
                        }
                    })
                    .catch((error: unknown) => {
                        if (
                            error instanceof DOMException &&
                            error.name === 'AbortError'
                        )
                            return;
                        if (
                            secuencia === secuenciaConsultaProductorRef.current
                        ) {
                            setErrorBusqueda(
                                'No fue posible verificar el documento por un problema de conexión o sesión. Puedes reintentar la consulta.',
                            );
                            setEstadoConsultaProductor('error');
                        }
                    })
                    .finally(() => {
                        if (secuencia === secuenciaConsultaProductorRef.current)
                            setBuscandoProductor(false);
                    }),
            300,
        );
    };
    const seleccionarProductor = (productor: ProductorEncontrado) => {
        identidadProductorModificadaRef.current = false;
        setProductorSeleccionado(productor);
        setResultadosProductor([]);
        setPredioExistente('');
        limpiarDatosPredio();
        setEstadoConsultaProductor('encontrado');
        const valores = {
            productor_existente: productor.productor,
            nombres: productor.nombres,
            apellidos: productor.apellidos,
            tipo_documento: productor.tipo_documento,
            numero_documento: productor.numero_documento,
            telefono: productor.telefono ?? '',
            sexo: productor.sexo ?? '',
        };
        Object.entries(valores).forEach(([nombre, valor]) => {
            const control = formularioRef.current?.elements.namedItem(
                nombre,
            ) as HTMLInputElement | HTMLSelectElement | null;
            if (control) {
                control.value = String(valor);
                control.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    };
    const seleccionarPredio = (id: string) => {
        setPredioExistente(id);
        if (id === '') {
            limpiarDatosPredio();
            return;
        }
        const predio = productorSeleccionado?.predios.find(
            (item) => String(item.predio) === id,
        );
        if (!predio) return;
        const municipio = divipolas.find(
            (item) => String(item.divipola) === String(predio.divipola ?? ''),
        );
        setDepartamentoSeleccionado(
            String(municipio?.codigo_departamento ?? ''),
        );
        setDivipolaSeleccionada(String(predio.divipola ?? ''));
        setCorregimientoSeleccionado(String(predio.corregimiento ?? ''));
        setVeredaSeleccionada(String(predio.vereda ?? ''));
        setNombrePredio(predio.nombre ?? '');
        setLatitud(String(predio.latitud ?? ''));
        setLongitud(String(predio.longitud ?? ''));
    };

    const cambiarDepartamento = (codigo: string) => {
        setDepartamentoSeleccionado(codigo);
        const municipioActual = divipolas.find(
            (item) => String(item.divipola) === divipolaSeleccionada,
        );
        if (
            !municipioActual ||
            String(municipioActual.codigo_departamento) !== codigo
        ) {
            setDivipolaSeleccionada('');
            setCorregimientoSeleccionado('');
            setVeredaSeleccionada('');
        }
    };

    const cambiarMunicipio = (id: string) => {
        const municipio = divipolas.find(
            (item) => String(item.divipola) === id,
        );
        setDepartamentoSeleccionado(
            String(municipio?.codigo_departamento ?? ''),
        );
        setDivipolaSeleccionada(id);
        const corregimientoActual = corregimientos.find(
            (item) => String(item.corregimiento) === corregimientoSeleccionado,
        );
        if (
            !corregimientoActual ||
            String(corregimientoActual.divipola) !== id
        ) {
            setCorregimientoSeleccionado('');
            setVeredaSeleccionada('');
        }
    };

    const cambiarCorregimiento = (id: string) => {
        setCorregimientoSeleccionado(id);
        const veredaActual = veredas.find(
            (item) => String(item.vereda) === veredaSeleccionada,
        );
        if (!veredaActual || String(veredaActual.corregimiento) !== id) {
            setVeredaSeleccionada('');
        }
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
        const archivos = Array.from(event.target.files ?? []);
        const validos = archivos.filter(
            (file) =>
                ['image/jpeg', 'image/png'].includes(file.type) &&
                file.size <= 5 * 1024 * 1024,
        );
        if (validos.length !== archivos.length) {
            toast.error('Solo se permiten imágenes JPG o PNG de máximo 5 MB.');
        }
        setPhotoFiles((actuales) => [
            ...actuales,
            ...validos.filter(
                (archivo) =>
                    !actuales.some(
                        (actual) =>
                            actual.name === archivo.name &&
                            actual.size === archivo.size &&
                            actual.lastModified === archivo.lastModified,
                    ),
            ),
        ]);
        event.target.value = '';
    };

    useEffect(() => {
        if (fotoVisor === null) return;
        const navegar = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setFotoVisor(null);
            if (event.key === 'ArrowRight') setFotoVisor((actual) => actual === null ? null : Math.min(actual + 1, fotografiasVisor.length - 1));
            if (event.key === 'ArrowLeft') setFotoVisor((actual) => actual === null ? null : Math.max(actual - 1, 0));
        };
        window.addEventListener('keydown', navegar);
        return () => window.removeEventListener('keydown', navegar);
    }, [fotoVisor, fotografiasVisor.length]);

    const abrirFoto = (indice: number) => {
        setFotoVisor(indice);
        setZoomFoto(1);
    };

    const cambiarUnidadArea = (unidad: UnidadArea) => {
        if (unidad === unidadArea) return;

        setValorArea(moverDecimal(valorArea, unidad === 'areas' ? 2 : -2));
        setUnidadArea(unidad);
    };

    const valorEquivalente =
        valorArea === ''
            ? ''
            : moverDecimal(valorArea, unidadArea === 'areas' ? -2 : 2);

    const enviarFormulario = (definitivo: boolean) => {
        if (!formularioRef.current || guardandoRef.current) return;
        const numeroDocumento = valorCampo('numero_documento').trim();
        const esBorrador = visita?.estado === 'borrador';
        if (
            definitivo &&
            !esBorrador &&
            numeroDocumento.length >= 3 &&
            !['encontrado', 'no-encontrado', 'edicion'].includes(
                estadoConsultaProductor,
            )
        ) {
            const mensaje =
                'Verifica el documento del productor antes de confirmar la visita.';
            setMensajeBorrador(mensaje);
            toast.error(mensaje);
            return;
        }
        guardandoRef.current = true;
        setGuardando(true);
        setErroresGuardado({});
        setMensajeBorrador('');
        const datos = new FormData(formularioRef.current);
        photoFiles.forEach((fotografia) => {
            datos.append('fotografias[]', fotografia);
        });
        datos.set(
            'productor_existente',
            productorSeleccionado
                ? String(productorSeleccionado.productor)
                : visita && !identidadProductorModificadaRef.current
                  ? String(visita.productor_existente ?? '')
                  : '',
        );
        datos.set('predio_existente', predioExistente);
        const ruta = visita
            ? `/visitas-extensionismo/${visita.id}${definitivo ? '' : '/borrador'}`
            : definitivo
              ? '/visitas-extensionismo'
              : '/visitas-extensionismo/borrador';
        if (visita) datos.set('_method', 'put');
        router.post(ruta, datos, {
            forceFormData: true,
            onError: (errors) => {
                const normalizados = Object.fromEntries(
                    Object.entries(errors).map(([campo, mensaje]) => [
                        campo,
                        Array.isArray(mensaje)
                            ? mensaje.join(' ')
                            : String(mensaje),
                    ]),
                );
                setErroresGuardado(normalizados);
                setMensajeBorrador(MENSAJE_ERROR_GUARDADO);
                toast.error(MENSAJE_ERROR_GUARDADO);
            },
            onHttpException: () => {
                setMensajeBorrador(MENSAJE_ERROR_GUARDADO);
                toast.error(MENSAJE_ERROR_GUARDADO);
            },
            onNetworkError: () => {
                setMensajeBorrador(MENSAJE_ERROR_GUARDADO);
                toast.error(MENSAJE_ERROR_GUARDADO);
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

    const handleGuardarBorrador = () => {
        enviarFormulario(false);
    };

    return (
        <>
            <Head
                title={
                    visita
                        ? 'Editar visita de extensionismo'
                        : 'Nueva visita de extensionismo'
                }
            />
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
                            {
                                label: visita
                                    ? 'Editar visita'
                                    : 'Nueva visita',
                                tone: 'accent',
                            },
                        ]}
                    />

                    <FormularioSeccionesNav sections={seccionesVisita} />

                    <form
                        ref={formularioRef}
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-[26px] pb-2"
                    >
                        <SectionCard
                            id="usuario"
                            number="01"
                            title="Caracterización del usuario"
                            description="Identificación y datos básicos del productor."
                            icon={UserRound}
                            tone="green"
                        >
                            <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                <Field
                                    label="Tipo de documento"
                                    name="tipo_documento"
                                    required
                                    className="md:col-span-4"
                                >
                                    <SelectField
                                        icon={FileText}
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
                                        onValueChange={(value) =>
                                            cambiarIdentidadProductor(
                                                value,
                                                valorCampo('numero_documento'),
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Número de documento"
                                    name="numero_documento"
                                    required
                                    className="md:col-span-4"
                                >
                                    <FieldControl
                                        icon={FileText}
                                        inputMode="numeric"
                                        placeholder="Ingrese el número de documento"
                                        onChange={(event) =>
                                            cambiarIdentidadProductor(
                                                valorCampo('tipo_documento'),
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <div className="md:col-span-4" />
                                <Field
                                    label="Nombres"
                                    required
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        icon={UserRound}
                                        placeholder="Ingrese los nombres"
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
                                <div className="md:col-span-4" />
                                {buscandoProductor && (
                                    <p
                                        role="status"
                                        className="text-sm text-[#3E5547] md:col-span-12"
                                    >
                                        Verificando el documento…
                                    </p>
                                )}
                                {estadoConsultaProductor === 'encontrado' &&
                                    productorSeleccionado && (
                                        <div
                                            role="status"
                                            className="rounded-[16px] border border-[#8EBB7E] bg-[#E4F1DD] p-4 text-[#10281D] md:col-span-12"
                                        >
                                            <p className="font-extrabold">
                                                Productor registrado
                                            </p>
                                            <p className="mt-1 text-sm">
                                                Ya existe un productor
                                                registrado con este documento.
                                                Se recuperarán sus datos para
                                                continuar con la visita. Puede
                                                seleccionar uno de sus predios
                                                existentes o registrar un nuevo
                                                predio.
                                            </p>
                                        </div>
                                    )}
                                {estadoConsultaProductor ===
                                    'no-encontrado' && (
                                    <div
                                        role="status"
                                        className="rounded-[16px] border border-[#B5CAAE] bg-[#F7FBF4] p-4 text-[#10281D] md:col-span-12"
                                    >
                                        <p className="font-extrabold">
                                            Productor no registrado
                                        </p>
                                        <p className="mt-1 text-sm">
                                            No encontramos un productor con este
                                            documento. Puede continuar
                                            diligenciando sus datos para
                                            registrarlo junto con su predio al
                                            guardar la visita.
                                        </p>
                                    </div>
                                )}
                                {estadoConsultaProductor === 'error' && (
                                    <div
                                        role="alert"
                                        className="rounded-[16px] border border-[#E5A18F] bg-[#FFF1ED] p-4 text-[#7D2919] md:col-span-12"
                                    >
                                        <p className="font-extrabold">
                                            {errorBusqueda}
                                        </p>
                                        <button
                                            type="button"
                                            className="mt-2 text-sm font-bold underline"
                                            onClick={() =>
                                                buscarProductor(
                                                    valorCampo(
                                                        'tipo_documento',
                                                    ),
                                                    valorCampo(
                                                        'numero_documento',
                                                    ),
                                                )
                                            }
                                        >
                                            Reintentar consulta
                                        </button>
                                    </div>
                                )}
                                {resultadosProductor.length > 1 &&
                                    resultadosProductor.map((productor) => (
                                        <button
                                            key={productor.productor}
                                            type="button"
                                            onClick={() =>
                                                seleccionarProductor(productor)
                                            }
                                            className="block rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#10281D] hover:bg-[#E4F1DD] md:col-span-12"
                                        >
                                            {productor.nombres}{' '}
                                            {productor.apellidos} ·{' '}
                                            {productor.tipo_documento}{' '}
                                            {productor.numero_documento}
                                        </button>
                                    ))}
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="predio"
                            number="02"
                            title="Datos del predio"
                            description="Información general de ubicación, identificación del predio y georreferenciación."
                            icon={MapPin}
                            tone="blue"
                        >
                            {productorSeleccionado && (
                                <div className="mb-5 rounded-[16px] border border-[#8EBB7E] bg-[#E4F1DD] p-4">
                                    <FieldLabel>
                                        Predio del productor
                                    </FieldLabel>
                                    <SelectField
                                        value={predioExistente}
                                        onValueChange={seleccionarPredio}
                                        icon={Home}
                                        placeholder="Registrar un predio nuevo"
                                        options={productorSeleccionado.predios.map(
                                            (predio) => ({
                                                value: String(predio.predio),
                                                label: predio.nombre,
                                            }),
                                        )}
                                    />
                                    <p className="mt-2 text-sm text-[#3E5547]">
                                        Selecciona un predio existente o deja
                                        esta opción vacía para registrar uno
                                        nuevo.
                                    </p>
                                </div>
                            )}
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
                                    <SelectField
                                        icon={MapPin}
                                        value={departamentoSeleccionado}
                                        onValueChange={cambiarDepartamento}
                                        options={[
                                            ...new Map(
                                                divipolas.map((item) => [
                                                    String(
                                                        item.codigo_departamento,
                                                    ),
                                                    {
                                                        value: String(
                                                            item.codigo_departamento,
                                                        ),
                                                        label: String(
                                                            item.nombre_departamento,
                                                        ),
                                                    },
                                                ]),
                                            ).values(),
                                        ]}
                                    />
                                </Field>
                                <Field
                                    label="Municipio"
                                    required
                                    className="md:col-span-5"
                                >
                                    <SelectField
                                        icon={MapPin}
                                        value={divipolaSeleccionada}
                                        onValueChange={cambiarMunicipio}
                                        options={municipiosVisibles.map((item) => ({
                                            value: String(item.divipola),
                                            label: `${item.codigo_municipio} · ${item.nombre_municipio}`,
                                        }))}
                                    />
                                </Field>
                                <Field
                                    label="Corregimiento"
                                    required
                                    className="md:col-span-6"
                                >
                                    <SelectField
                                        icon={MapPin}
                                        value={corregimientoSeleccionado}
                                        onValueChange={cambiarCorregimiento}
                                        options={corregimientosVisibles.map((item) => ({
                                            value: String(item.corregimiento),
                                            label: String(item.nombre),
                                        }))}
                                    />
                                </Field>
                                <Field
                                    label="Vereda"
                                    required
                                    className="md:col-span-6"
                                >
                                    <SelectField
                                        icon={MapPin}
                                        value={veredaSeleccionada}
                                        onValueChange={setVeredaSeleccionada}
                                        options={veredasVisibles.map((item) => ({
                                            value: String(item.vereda),
                                            label: String(item.nombre),
                                        }))}
                                    />
                                </Field>
                                <Field
                                    label="Nombre del predio"
                                    required
                                    className="md:col-span-12"
                                >
                                    <FieldControl
                                        icon={Home}
                                        value={nombrePredio}
                                        onChange={(event) =>
                                            setNombrePredio(event.target.value)
                                        }
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
                            id="actividad"
                            number="03"
                            title="Actividad productiva"
                            description="Información de la actividad productiva priorizada y secundaria."
                            icon={Leaf}
                            tone="leaf"
                        >
                            <div className="grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                <Field
                                    label="Línea productiva principal"
                                    name="linea_productiva_principal"
                                    required
                                    className="md:col-span-4"
                                >
                                    {lineaPrincipalHistorica ? (
                                        <div className="space-y-2">
                                            <input
                                                type="hidden"
                                                name="linea_productiva_principal"
                                                value={lineaPrincipalHistorica.id}
                                            />
                                            <div className="flex min-h-[50px] items-center justify-between rounded-[16px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-[18px] text-[16px] text-[#10281D]">
                                                <span>
                                                    {lineaPrincipalHistorica.nombre}
                                                </span>
                                                <span className="ml-3 text-[13px] font-semibold text-[#5A6F61]">
                                                    Registro histórico
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="text-left text-[14px] font-semibold text-[#17803D] underline underline-offset-4"
                                                onClick={() => {
                                                    setLineaPrincipalHistorica(
                                                        null,
                                                    );
                                                    setPrimaryLine('');
                                                    setSpecies('');
                                                    setSpeciesOther('');
                                                }}
                                            >
                                                Cambiar a Agrícola o Pecuario
                                            </button>
                                        </div>
                                    ) : (
                                        <SelectField
                                            name="linea_productiva_principal"
                                            icon={Leaf}
                                            options={lineasProductivasPermitidas.map(
                                                (item) => ({
                                                    value: String(
                                                        item.linea_productiva,
                                                    ),
                                                    label: String(item.nombre),
                                                }),
                                            )}
                                            value={primaryLine}
                                            onValueChange={cambiarLineaPrincipal}
                                        />
                                    )}
                                </Field>
                                {['AGRICOLA', 'PECUARIO'].includes(
                                    categoriaPrincipal,
                                ) && (
                                    <Field
                                        label="Especie"
                                        name="especie_productiva"
                                        required
                                        className="md:col-span-4"
                                    >
                                        <SelectField
                                            name="especie_productiva"
                                            icon={Layers}
                                            options={especiesVisibles.map(
                                                (item) => ({
                                                    value: String(
                                                        item.especie_productiva,
                                                    ),
                                                    label: String(item.nombre),
                                                    group:
                                                        categoriaPrincipal ===
                                                        'AGRICOLA'
                                                            ? etiquetaGrupoEspecie[
                                                                  String(
                                                                      item.grupo,
                                                                  )
                                                              ]
                                                            : undefined,
                                                }),
                                            )}
                                            value={species}
                                            onValueChange={setSpecies}
                                        />
                                    </Field>
                                )}
                                <Field
                                    label="Línea productiva secundaria"
                                    name="linea_productiva_secundaria"
                                    className="md:col-span-4"
                                >
                                    {lineaSecundariaHistorica ? (
                                        <div className="space-y-2">
                                            <input
                                                type="hidden"
                                                name="linea_productiva_secundaria"
                                                value={lineaSecundariaHistorica.id}
                                            />
                                            <div className="flex min-h-[50px] items-center justify-between rounded-[16px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-[18px] text-[16px] text-[#10281D]">
                                                <span>
                                                    {lineaSecundariaHistorica.nombre}
                                                </span>
                                                <span className="ml-3 text-[13px] font-semibold text-[#5A6F61]">
                                                    Registro histórico
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="text-left text-[14px] font-semibold text-[#17803D] underline underline-offset-4"
                                                onClick={() => {
                                                    setLineaSecundariaHistorica(
                                                        null,
                                                    );
                                                    setSecondaryLine('');
                                                }}
                                            >
                                                Cambiar a Agrícola o Pecuario
                                            </button>
                                        </div>
                                    ) : (
                                        <SelectField
                                            name="linea_productiva_secundaria"
                                            icon={Leaf}
                                            options={lineasProductivasPermitidas.map(
                                                (item) => ({
                                                    value: String(
                                                        item.linea_productiva,
                                                    ),
                                                    label: String(item.nombre),
                                                }),
                                            )}
                                            value={secondaryLine}
                                            onValueChange={cambiarLineaSecundaria}
                                        />
                                    )}
                                </Field>
                                {especieEsOtra && (
                                    <Field
                                        label="Especifique la especie"
                                        required
                                        className="md:col-span-4"
                                    >
                                        <TextAreaField
                                            name="especie_productiva_otra"
                                            value={speciesOther}
                                            onChange={(event) =>
                                                setSpeciesOther(
                                                    event.target.value,
                                                )
                                            }
                                            rows={2}
                                            placeholder="Describa la especie"
                                        />
                                    </Field>
                                )}
                                <Field
                                    label="Número de animales"
                                    name="numero_animales"
                                    className="md:col-span-6"
                                >
                                    <FieldControl
                                        name="numero_animales"
                                        icon={Hash}
                                        inputMode="numeric"
                                        placeholder="Ingrese el número de animales"
                                    />
                                </Field>
                                <Field
                                    label={
                                        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                            <span>
                                                Área destinada en la línea
                                                productiva priorizada
                                            </span>
                                            {valorEquivalente !== '' && (
                                                <span className="text-[14px] font-semibold text-[#3E5547]">
                                                    Equivalente a{' '}
                                                    {formatearSuperficie(
                                                        valorEquivalente,
                                                    )}{' '}
                                                    {unidadArea === 'areas'
                                                        ? 'hectáreas'
                                                        : 'áreas'}
                                                    .
                                                </span>
                                            )}
                                        </span>
                                    }
                                    required
                                    className="md:col-span-6"
                                >
                                    <div className="flex flex-wrap items-stretch gap-3 sm:flex-nowrap">
                                        <input
                                            type="hidden"
                                            name="unidad_area_ingresada"
                                            value={unidadArea}
                                        />
                                        <div
                                            role="group"
                                            aria-label="Unidad de superficie"
                                            className="inline-flex rounded-[14px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] p-1"
                                        >
                                            {(
                                                [
                                                    ['areas', 'Áreas (a)'],
                                                    [
                                                        'hectareas',
                                                        'Hectáreas (ha)',
                                                    ],
                                                ] as const
                                            ).map(([unidad, etiqueta]) => (
                                                <button
                                                    key={unidad}
                                                    type="button"
                                                    aria-pressed={
                                                        unidadArea === unidad
                                                    }
                                                    onClick={() =>
                                                        cambiarUnidadArea(
                                                            unidad,
                                                        )
                                                    }
                                                    className={cn(
                                                        'min-h-9 rounded-[10px] px-4 text-[14px] font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#4E9A2B]/60',
                                                        unidadArea === unidad
                                                            ? 'bg-[#17803D] text-white shadow-[0_2px_0_#0E3B2A]'
                                                            : 'text-[#2F6A45] hover:bg-white',
                                                    )}
                                                >
                                                    {etiqueta}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="min-w-0 grow basis-40">
                                            <FieldControl
                                                name="area_valor_ingresado"
                                                icon={Ruler}
                                                inputMode="decimal"
                                                value={valorArea}
                                                onChange={(event) => {
                                                    const valor =
                                                        event.target.value;
                                                    if (
                                                        /^\d*(?:[.,]\d*)?$/.test(
                                                            valor,
                                                        )
                                                    ) {
                                                        setValorArea(valor);
                                                    }
                                                }}
                                                placeholder="Ej. 2,50"
                                            />
                                        </div>
                                    </div>
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
                                    {enfoquesPoblacionales.map((enfoque) => (
                                        <CheckOption
                                            key={String(
                                                enfoque.enfoque_poblacional,
                                            )}
                                            value={String(
                                                enfoque.enfoque_poblacional,
                                            )}
                                        >
                                            {String(enfoque.nombre)}
                                        </CheckOption>
                                    ))}
                                </div>
                                <div className="mt-[22px] border-t-2 border-dashed border-[#B5CAAE]" />
                                <div className="mt-[18px] grid gap-x-5 gap-y-[18px] md:grid-cols-12">
                                    <Field
                                        label="Tipo de discapacidad"
                                        name="tipo_discapacidad"
                                        className="md:col-span-6"
                                    >
                                        <SelectField
                                            name="tipo_discapacidad"
                                            icon={UsersRound}
                                            options={[
                                                { value: 'Ninguna', label: 'Ninguna' },
                                                { value: 'Física', label: 'Física' },
                                                { value: 'Visual', label: 'Visual' },
                                                { value: 'Auditiva', label: 'Auditiva' },
                                                { value: 'Intelectual', label: 'Intelectual' },
                                                { value: 'Psicosocial', label: 'Psicosocial' },
                                                { value: 'Múltiple', label: 'Múltiple' },
                                                { value: 'Sordoceguera', label: 'Sordoceguera' },
                                            ]}
                                            value={tipoDiscapacidad}
                                            onValueChange={setTipoDiscapacidad}
                                        />
                                    </Field>
                                    <div className="md:col-span-6">
                                        <FieldLabel required>
                                            ¿Es víctima del conflicto armado?
                                        </FieldLabel>
                                        <div className="inline-flex gap-1 rounded-[18px] border-[1.5px] border-[#B3C7AE] bg-[#E3EDDF] p-1">
                                            <RadioOption
                                                name="victima_conflicto_armado"
                                                value="S"
                                                label="Sí"
                                            />
                                            <RadioOption
                                                name="victima_conflicto_armado"
                                                value="N"
                                                label="No"
                                            />
                                        </div>
                                    </div>
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
                                                value="S"
                                                label="Sí"
                                                required
                                            />
                                            <RadioOption
                                                name="sisben"
                                                value="N"
                                                label="No"
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
                                                value="S"
                                                label="Sí"
                                                required
                                            />
                                            <RadioOption
                                                name="asociacion"
                                                value="N"
                                                label="No"
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
                                                name={
                                                    [
                                                        'principales_proveedores',
                                                        'principales_compradores',
                                                        'fuentes_consulta',
                                                    ][index]
                                                }
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
                                    accept="image/jpeg,image/png"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="sr-only"
                                />
                            </label>
                            {visita?.fotografias &&
                                visita.fotografias.length > 0 && (
                                    <div className="mt-3 rounded-[16px] border border-[#B5CAAE] bg-[#F7FBF4] p-4">
                                        <p className="text-sm font-bold text-[#10281D]">
                                            Fotografías existentes
                                        </p>
                                        <ul className="mt-2 list-inside list-disc text-sm text-[#3E5547]">
                                            {visita.fotografias.map(
                                                (fotografia, indice) => (
                                                    <li
                                                        key={`${fotografia.nombre ?? 'fotografia'}-${indice}`}
                                                    >
                                            {fotografia.id ? (
                                                            <div className="flex items-center gap-3">
                                                                <button type="button" onClick={() => abrirFoto(indice)} className="overflow-hidden rounded-xl border border-[#B5CAAE]">
                                                                    <img src={`/visitas-extensionismo/${visita.id}/fotografias/${fotografia.id}`} alt={fotografia.nombre ?? 'Fotografía adjunta'} className="size-20 object-cover" />
                                                                </button>
                                                                <span className="truncate">{fotografia.nombre ?? 'Fotografía adjunta'}</span>
                                                                <button type="button" onClick={() => { if (window.confirm('¿Eliminar esta fotografía?')) router.delete(`/visitas-extensionismo/${visita.id}/fotografias/${fotografia.id}`); }} className="text-sm font-bold text-[#9E2A2B]">Eliminar</button>
                                                            </div>
                                                        ) : (
                                                            (fotografia.nombre ??
                                                            'Fotografía adjunta')
                                                        )}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            {photoFiles.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {photoFiles.map((file, indice) => (
                                        <div
                                            key={`${file.name}-${file.lastModified}`}
                                            className="relative overflow-hidden rounded-[16px] border-[1.5px] border-[#B5CAAE] bg-white shadow-[0_3px_0_rgba(14,59,42,0.14)]"
                                        >
                                            <button type="button" onClick={() => abrirFoto((visita?.fotografias?.length ?? 0) + indice)} className="block w-full"><img src={fotografiasVisor[(visita?.fotografias?.length ?? 0) + indice]?.src} alt={file.name} className="h-28 w-full object-cover" /></button>
                                            <div className="flex items-center justify-between gap-2 p-2 text-xs font-bold text-[#10281D]">
                                                <span className="truncate">{file.name}</span>
                                                <button type="button" aria-label={`Quitar ${file.name}`} onClick={() => setPhotoFiles((actuales) => actuales.filter((_, posicion) => posicion !== indice))} className="rounded-full px-2 py-1 text-[#9E2A2B] hover:bg-[#FCE8E8]">Quitar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {fotoVisor !== null && fotografiasVisor[fotoVisor] && (
                            <div role="dialog" aria-modal="true" aria-label="Visor fotográfico" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setFotoVisor(null)}>
                                <div className="flex max-h-full w-full max-w-5xl flex-col items-center gap-4" onClick={(event) => event.stopPropagation()}>
                                    <div className="flex w-full items-center justify-between text-white">
                                        <span className="truncate text-sm">{fotografiasVisor[fotoVisor].nombre}</span>
                                        <button type="button" onClick={() => setFotoVisor(null)} className="rounded-xl px-3 py-2 text-2xl" aria-label="Cerrar visor">×</button>
                                    </div>
                                    <img src={fotografiasVisor[fotoVisor].src} alt={fotografiasVisor[fotoVisor].nombre} style={{ transform: `scale(${zoomFoto})` }} className="max-h-[70vh] max-w-full object-contain transition-transform" />
                                    <div className="flex flex-wrap items-center justify-center gap-2 text-white">
                                        <button type="button" disabled={fotoVisor === 0} onClick={() => abrirFoto(fotoVisor - 1)} className="rounded-xl bg-white/15 px-4 py-2 disabled:opacity-40">Anterior</button>
                                        <button type="button" onClick={() => setZoomFoto((zoom) => Math.min(zoom + 0.25, 3))} className="rounded-xl bg-white/15 px-4 py-2">Zoom +</button>
                                        <button type="button" onClick={() => setZoomFoto((zoom) => Math.max(zoom - 0.25, 1))} className="rounded-xl bg-white/15 px-4 py-2">Zoom −</button>
                                        <button type="button" disabled={fotoVisor === fotografiasVisor.length - 1} onClick={() => abrirFoto(fotoVisor + 1)} className="rounded-xl bg-white/15 px-4 py-2 disabled:opacity-40">Siguiente</button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    disabled={guardando}
                                    className="min-h-[50px] rounded-[18px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-7 text-[16px] font-extrabold text-[#10281D] hover:bg-[#E4F1DD]"
                                >
                                    <Save className="size-[18px]" />
                                    {guardando
                                        ? 'Guardando…'
                                        : 'Guardar borrador'}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={guardando}
                                    className="min-h-[50px] rounded-[18px] bg-[#FFC933] px-7 text-[16px] font-extrabold text-[#3A2A00] shadow-[0_5px_0_#B78A0E] hover:bg-[#FFD653]"
                                >
                                    <Save className="size-[18px]" />
                                    {guardando ? 'Guardando…' : 'Guardar visita'}
                                </Button>
                            </div>
                            {mensajeBorrador && (
                                <p
                                    role={
                                        Object.keys(erroresGuardado).length > 0
                                            ? 'alert'
                                            : 'status'
                                    }
                                    className={cn(
                                        'basis-full text-sm font-semibold',
                                        Object.keys(erroresGuardado).length > 0
                                            ? 'text-[#FFD2C8]'
                                            : 'text-[#FFF2B2]',
                                    )}
                                >
                                    {mensajeBorrador}
                                </p>
                            )}
                            {Object.entries(erroresGuardado).length > 0 && (
                                <div
                                    role="alert"
                                    className="basis-full rounded-[16px] border border-[#E5A18F] bg-[#7D2919] p-4 text-sm text-[#FFF1ED]"
                                >
                                    <p className="font-extrabold">
                                        Revisa estos campos antes de volver a guardar:
                                    </p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        {Object.entries(erroresGuardado).map(
                                            ([campo, error]) => {
                                                const base = campoBase(campo);
                                                const seccion =
                                                    SECCION_POR_CAMPO[base] ?? {
                                                        id: 'usuario',
                                                        nombre: 'Formulario',
                                                    };

                                                return (
                                                    <li key={campo}>
                                                        <a
                                                            className="underline"
                                                            href={`#${seccion.id}`}
                                                        >
                                                            {ETIQUETA_CAMPO[base] ??
                                                                base.replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )}{' '}
                                                            ({seccion.nombre})
                                                        </a>
                                                        : {error}
                                                    </li>
                                                );
                                            },
                                        )}
                                    </ul>
                                </div>
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
