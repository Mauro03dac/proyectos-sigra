import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileText,
    Filter,
    MapPin,
    Pencil,
    Plus,
    Search,
    UserRound,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SigraSelect } from '@/components/ui/sigra-select';
import { crear, index } from '@/routes/registro-productor';

type RegistroProductor = {
    numero: string;
    productor: string;
    extensionista: string;
    predio: string;
    vereda: string;
    fecha: string;
    fechaISO: string;
};

type PageProps = {
    registros?: RegistroProductor[];
};

const registrosPorPagina = 2;

const controlClassName =
    'h-12 w-full rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-4 text-[16px] text-[#10281D] outline-none transition hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:focus:bg-[#294330]';

function SelectFilter({
    label,
    value,
    options,
    icon: Icon,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    icon: LucideIcon;
    onChange: (value: string) => void;
}) {
    return (
        <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                {label}
            </span>
            <SigraSelect
                icon={Icon}
                value={value}
                onValueChange={onChange}
                placeholder="Todos"
                options={options.map((option) => ({
                    value: option,
                    label: option,
                }))}
            />
        </label>
    );
}

function PendingAction({
    registro,
    action,
    onClick,
}: {
    registro: RegistroProductor;
    action: string;
    onClick: (registro: RegistroProductor, action: string) => void;
}) {
    const className =
        action === 'Editar'
            ? 'bg-[#B45309] shadow-[0_3px_0_#7F3605] hover:bg-[#92400E] focus-visible:ring-[#B45309]/35'
            : action === 'PDF'
              ? 'bg-[#DC2626] shadow-[0_3px_0_#B91C1C] hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]/35'
              : 'bg-[#2563EB] shadow-[0_3px_0_#1747A5] hover:bg-[#1D4ED8] focus-visible:ring-[#2563EB]/35';
    const Icon = action === 'Editar' ? Pencil : FileText;

    return (
        <Button
            type="button"
            onClick={() => onClick(registro, action)}
            className={`min-h-11 rounded-[14px] px-4 text-[15px] font-bold text-white focus-visible:ring-[4px] ${className}`}
        >
            <Icon className="size-[18px]" />
            {action}
        </Button>
    );
}

export default function ListadoRegistroProductor() {
    const { registros: registrosProductor = [] } = usePage<PageProps>().props;
    const [busqueda, setBusqueda] = useState('');
    const [productor, setProductor] = useState('');
    const [extensionista, setExtensionista] = useState('');
    const [vereda, setVereda] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [pagina, setPagina] = useState(1);
    const [accionPendiente, setAccionPendiente] = useState<{
        numero: string;
        accion: string;
    } | null>(null);

    const extensionistas = useMemo(
        () =>
            Array.from(
                new Set(
                    registrosProductor.map(
                        (registro) => registro.extensionista,
                    ),
                ),
            ),
        [],
    );
    const veredas = useMemo(
        () =>
            Array.from(
                new Set(registrosProductor.map((registro) => registro.vereda)),
            ),
        [],
    );
    const registrosFiltrados = useMemo(() => {
        const textoBusqueda = busqueda.trim().toLowerCase();
        const textoProductor = productor.trim().toLowerCase();

        return registrosProductor.filter((registro) => {
            return (
                registro.numero.toLowerCase().includes(textoBusqueda) &&
                registro.productor.toLowerCase().includes(textoProductor) &&
                (!extensionista || registro.extensionista === extensionista) &&
                (!vereda || registro.vereda === vereda) &&
                (!fechaDesde || registro.fechaISO >= fechaDesde) &&
                (!fechaHasta || registro.fechaISO <= fechaHasta)
            );
        });
    }, [busqueda, extensionista, fechaDesde, fechaHasta, productor, vereda]);

    useEffect(() => {
        setPagina(1);
    }, [busqueda, extensionista, fechaDesde, fechaHasta, productor, vereda]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(registrosFiltrados.length / registrosPorPagina),
    );
    const paginaActual = Math.min(pagina, totalPaginas);
    const registrosVisibles = registrosFiltrados.slice(
        (paginaActual - 1) * registrosPorPagina,
        paginaActual * registrosPorPagina,
    );
    const totalRegistros = registrosProductor.length;
    const veredasAtendidas = new Set(
        registrosProductor
            .map((registro) =>
                registro.vereda.trim().replace(/\s+/g, ' ').toLocaleLowerCase(),
            )
            .filter(Boolean),
    ).size;
    const indicadores = [
        {
            title: 'Resumen de registros',
            value: totalRegistros,
            description: 'Caracterizaciones disponibles',
            icon: ClipboardList,
            iconClassName: 'bg-[#17803D] text-white',
        },
        {
            title: 'Seguimiento',
            value: 0,
            description: 'Borradores',
            icon: CalendarDays,
            iconClassName: 'bg-[#1B86B5] text-white',
        },
        {
            title: 'Cobertura territorial',
            value: veredasAtendidas,
            description: 'Veredas atendidas',
            icon: MapPin,
            iconClassName: 'bg-[#4E9A2B] text-white',
        },
    ] as const;

    const limpiarFiltros = () => {
        setBusqueda('');
        setProductor('');
        setExtensionista('');
        setVereda('');
        setFechaDesde('');
        setFechaHasta('');
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
                    <section className="flex flex-col gap-5 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px] lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-3 flex items-center gap-3">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#17803D] text-white shadow-[0_4px_0_#0E3B2A]">
                                    <ClipboardList
                                        className="size-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <span className="text-[15px] font-extrabold text-[#3E5547]">
                                    Gestión de registros
                                </span>
                            </div>
                            <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.03em] text-[#10281D]">
                                Registro del productor
                            </h1>
                            <p className="mt-2 max-w-2xl text-[16px] leading-[1.5] text-[#3E5547]">
                                Consulta y administra la caracterización de
                                predios productivos agropecuarios.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="min-h-12 shrink-0 rounded-[16px] bg-[#17803D] px-6 text-[16px] font-extrabold text-white shadow-[0_5px_0_#0E3B2A] hover:bg-[#126B32] focus-visible:ring-[4px] focus-visible:ring-[#17803D]/35"
                        >
                            <Link href={crear()}>
                                <Plus className="size-5" strokeWidth={2.5} />
                                Nuevo registro
                            </Link>
                        </Button>
                    </section>

                    <section
                        aria-label="Indicadores de registros del productor"
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {indicadores.map((indicador) => {
                            const Icon = indicador.icon;

                            return (
                                <article
                                    key={indicador.title}
                                    className="rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_4px_0_rgba(14,59,42,0.1),0_18px_26px_-22px_rgba(14,59,42,0.5)] dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                                >
                                    <div className="flex items-start gap-4">
                                        <span
                                            className={`flex size-12 shrink-0 items-center justify-center rounded-[16px] shadow-[0_3px_0_rgba(14,59,42,0.18)] ${indicador.iconClassName}`}
                                        >
                                            <Icon
                                                className="size-6"
                                                strokeWidth={2}
                                            />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[16px] font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                                {indicador.title}
                                            </p>
                                            <p className="mt-2 text-[32px] leading-none font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                                {indicador.value}
                                            </p>
                                            <p className="mt-2 text-[15px] text-[#607665] dark:text-[#BFD9C5]">
                                                {indicador.description}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                        <div className="flex flex-col gap-2 border-b-2 border-dashed border-[#B5CAAE] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#3E5B46]">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-[15px] bg-[#E4F1DD] text-[#17803D] dark:bg-[#294330] dark:text-[#A9D8AF]">
                                    <Filter
                                        className="size-5"
                                        strokeWidth={2.3}
                                    />
                                </span>
                                <div>
                                    <h2 className="text-[20px] font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                        Filtros de búsqueda
                                    </h2>
                                    <p className="text-[15px] text-[#3E5547] dark:text-[#BFD9C5]">
                                        Combina criterios para consultar los
                                        registros disponibles.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={limpiarFiltros}
                                className="min-h-11 self-start rounded-[14px] px-4 text-[15px] font-bold text-[#17803D] hover:bg-[#E4F1DD] hover:text-[#126B32] sm:self-auto"
                            >
                                <X className="size-[18px]" />
                                Limpiar filtros
                            </Button>
                        </div>

                        <div className="mt-6 grid gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-7">
                            <label className="flex min-w-0 flex-col gap-2 xl:col-span-2">
                                <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                                    Buscar
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#2F6A45] dark:text-[#9DCEA8]" />
                                    <Input
                                        value={busqueda}
                                        onChange={(event) =>
                                            setBusqueda(event.target.value)
                                        }
                                        placeholder="Número de registro"
                                        className="h-12 rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] pr-4 pl-12 text-[16px] text-[#10281D] placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus-visible:bg-[#294330]"
                                    />
                                </div>
                            </label>
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                                    Productor
                                </span>
                                <Input
                                    value={productor}
                                    onChange={(event) =>
                                        setProductor(event.target.value)
                                    }
                                    placeholder="Nombre del productor"
                                    className={`${controlClassName} placeholder:text-[15px] placeholder:text-[#5A6F61] dark:placeholder:text-[#AFC7B5]`}
                                />
                            </label>
                            <SelectFilter
                                label="Extensionista"
                                value={extensionista}
                                options={extensionistas}
                                icon={UserRound}
                                onChange={setExtensionista}
                            />
                            <SelectFilter
                                label="Vereda"
                                value={vereda}
                                options={veredas}
                                icon={MapPin}
                                onChange={setVereda}
                            />
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                                    Fecha desde
                                </span>
                                <Input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(event) =>
                                        setFechaDesde(event.target.value)
                                    }
                                    className={controlClassName}
                                />
                            </label>
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                                    Fecha hasta
                                </span>
                                <Input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(event) =>
                                        setFechaHasta(event.target.value)
                                    }
                                    className={controlClassName}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                        <div className="flex flex-col gap-3 border-b-2 border-dashed border-[#B5CAAE] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#3E5B46]">
                            <div>
                                <h2 className="text-[22px] font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                    Registros del productor
                                </h2>
                                <p className="mt-1 text-[15px] text-[#3E5547] dark:text-[#BFD9C5]">
                                    Las caracterizaciones guardadas aparecerán
                                    aquí.
                                </p>
                            </div>
                        </div>

                        {registrosVisibles.length > 0 ? (
                            <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                {registrosVisibles.map((registro) => (
                                    <article
                                        key={registro.numero}
                                        className="rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] p-5 shadow-[0_4px_0_rgba(14,59,42,0.1),0_18px_26px_-22px_rgba(14,59,42,0.5)] sm:p-6 dark:border-[#3E5B46] dark:bg-[#22352A]"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                    Número de registro
                                                </p>
                                                <h3 className="mt-1 text-[20px] font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                                    {registro.numero}
                                                </h3>
                                            </div>
                                        </div>

                                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                    Productor
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold text-[#10281D] dark:text-[#F0FFF3]">
                                                    {registro.productor}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                    Extensionista
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold text-[#10281D] dark:text-[#F0FFF3]">
                                                    {registro.extensionista}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                    Nombre del predio
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold text-[#10281D] dark:text-[#F0FFF3]">
                                                    {registro.predio}
                                                </dd>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 size-5 shrink-0 text-[#2F6A45] dark:text-[#9DCEA8]" />
                                                <div>
                                                    <dt className="text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                        Vereda
                                                    </dt>
                                                    <dd className="mt-1 text-[16px] font-bold text-[#10281D] dark:text-[#F0FFF3]">
                                                        {registro.vereda}
                                                    </dd>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#2F6A45] dark:text-[#9DCEA8]" />
                                                <div>
                                                    <dt className="text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                        Fecha del registro
                                                    </dt>
                                                    <dd className="mt-1 text-[16px] font-bold text-[#10281D] dark:text-[#F0FFF3]">
                                                        {registro.fecha}
                                                    </dd>
                                                </div>
                                            </div>
                                        </dl>

                                        <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-dashed border-[#B5CAAE] pt-5 dark:border-[#3E5B46]">
                                            {['Editar', 'PDF'].map((action) => (
                                                <PendingAction
                                                    key={action}
                                                    registro={registro}
                                                    action={action}
                                                    onClick={(
                                                        selected,
                                                        selectedAction,
                                                    ) =>
                                                        setAccionPendiente({
                                                            numero: selected.numero,
                                                            accion: selectedAction,
                                                        })
                                                    }
                                                />
                                            ))}
                                        </div>
                                        {accionPendiente?.numero ===
                                            registro.numero && (
                                            <p
                                                role="status"
                                                className="mt-4 text-[15px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]"
                                            >
                                                {accionPendiente.accion}:
                                                funcionalidad pendiente hasta
                                                integrar la persistencia.
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-dashed border-[#B5CAAE] bg-[#F7FBF4] px-5 py-8 text-center dark:border-[#3E5B46] dark:bg-[#22352A]">
                                <p className="font-semibold text-[#10281D] dark:text-[#F0FFF3]">
                                    No hay caracterizaciones registradas.
                                </p>
                                <p className="mt-1 text-[15px] text-[#607665] dark:text-[#BFD9C5]">
                                    Las caracterizaciones guardadas aparecerán
                                    aquí.
                                </p>
                            </div>
                        )}

                        {registrosFiltrados.length > 0 && (
                            <div className="mt-6 flex flex-col gap-4 border-t-2 border-dashed border-[#B5CAAE] pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#3E5B46]">
                                <p className="text-[15px] text-[#607665] dark:text-[#BFD9C5]">
                                    Mostrando {registrosVisibles.length} de{' '}
                                    {registrosFiltrados.length} registros
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        disabled={paginaActual <= 1}
                                        onClick={() =>
                                            setPagina(paginaActual - 1)
                                        }
                                        variant="outline"
                                        aria-label="Página anterior"
                                        className="size-11 rounded-[14px] border-[#B5CAAE] p-0"
                                    >
                                        <ChevronLeft className="size-5" />
                                    </Button>
                                    <span className="flex min-h-11 items-center rounded-[14px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] px-4 text-[15px] font-bold text-[#607665]">
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <Button
                                        type="button"
                                        disabled={paginaActual >= totalPaginas}
                                        onClick={() =>
                                            setPagina(paginaActual + 1)
                                        }
                                        variant="outline"
                                        aria-label="Página siguiente"
                                        className="size-11 rounded-[14px] border-[#B5CAAE] p-0"
                                    >
                                        <ChevronRight className="size-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

ListadoRegistroProductor.layout = {
    breadcrumbs: [
        {
            title: 'Registro del productor',
            href: index(),
        },
    ],
};
