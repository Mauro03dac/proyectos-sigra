import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    ClipboardList,
    FileText,
    Filter,
    MapPin,
    Pencil,
    Plus,
    Search,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { crear } from '@/routes/visitas-extensionismo';
import { visitasDemostracion } from './visitas-extensionismo/datos-demostracion';

const tipoVisitaDemostracion = 'Visita de extensionismo';

function fechaParaFiltro(fecha: string) {
    const [dia, mes, ano] = fecha.split('/');

    return `${ano}-${mes}-${dia}`;
}

function CampoSeleccion({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    options,
}: {
    label: string;
    icon: typeof UserRound;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: string[];
}) {
    return (
        <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[15px] font-semibold text-[#10281D]">
                {label}
            </span>
            <div className="relative">
                <Icon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#2F6A45]" />
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-12 w-full appearance-none rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] py-2 pr-10 pl-12 text-[16px] text-[#10281D] transition outline-none hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30"
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </label>
    );
}

export default function Dashboard() {
    const [busqueda, setBusqueda] = useState('');
    const [tipoVisita, setTipoVisita] = useState('');
    const [extensionista, setExtensionista] = useState('');
    const [vereda, setVereda] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [estado, setEstado] = useState('');
    const [visitaConAccionPendiente, setVisitaConAccionPendiente] = useState<
        string | null
    >(null);

    const registrosDisponibles = visitasDemostracion.map((visita) => ({
        ...visita,
        tipoVisita: tipoVisitaDemostracion,
        fechaParaFiltro: fechaParaFiltro(visita.fecha),
    }));
    const tiposVisita = [
        ...new Set(registrosDisponibles.map((registro) => registro.tipoVisita)),
    ];
    const extensionistas = [
        ...new Set(
            registrosDisponibles.map((registro) => registro.extensionista),
        ),
    ];
    const veredas = [
        ...new Set(registrosDisponibles.map((registro) => registro.vereda)),
    ];
    const estados = [
        ...new Set(registrosDisponibles.map((registro) => registro.estado)),
    ];
    const registrosFiltrados = registrosDisponibles.filter((registro) => {
        const textoBuscado = busqueda.trim().toLocaleLowerCase('es');

        return (
            (!textoBuscado ||
                registro.numero
                    .toLocaleLowerCase('es')
                    .includes(textoBuscado) ||
                registro.productor
                    .toLocaleLowerCase('es')
                    .includes(textoBuscado)) &&
            (!tipoVisita || registro.tipoVisita === tipoVisita) &&
            (!extensionista || registro.extensionista === extensionista) &&
            (!vereda || registro.vereda === vereda) &&
            (!fechaDesde || registro.fechaParaFiltro >= fechaDesde) &&
            (!fechaHasta || registro.fechaParaFiltro <= fechaHasta) &&
            (!estado || registro.estado === estado)
        );
    });

    const limpiarFiltros = () => {
        setBusqueda('');
        setTipoVisita('');
        setExtensionista('');
        setVereda('');
        setFechaDesde('');
        setFechaHasta('');
        setEstado('');
    };

    const indicadores = [
        {
            title: 'Visitas de extensionismo',
            value: visitasDemostracion.length,
            description: 'Visitas registradas',
            icon: ClipboardList,
            iconClassName: 'bg-[#17803D] text-white',
        },
        {
            title: 'Registro RUEA',
            value: '—',
            description: 'Sin datos integrados',
            icon: FileText,
            iconClassName: 'bg-[#1B86B5] text-white',
        },
        {
            title: 'Productores registrados',
            value: '—',
            description: 'Sin datos integrados',
            icon: UsersRound,
            iconClassName: 'bg-[#FFC933] text-[#3A2A00]',
        },
    ] as const;

    return (
        <>
            <Head title="Panel de registros SIGRA" />
            <main
                className="sigra-jakarta sigra-pulido min-w-0 flex-1 bg-[#DCE8D2] px-4 py-5 pb-8 sm:px-8 sm:py-[26px] sm:pb-11 xl:px-10"
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
                                    Gestión general
                                </span>
                            </div>
                            <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.03em] text-[#10281D]">
                                Panel de registros SIGRA
                            </h1>
                            <p className="mt-2 max-w-3xl text-[16px] leading-[1.5] text-[#3E5547]">
                                Consulta y gestiona la información principal de
                                Visitas de extensionismo, Registro RUEA y
                                Registro del productor.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="min-h-12 shrink-0 rounded-[16px] bg-[#17803D] px-6 text-[16px] font-extrabold text-white shadow-[0_5px_0_#0E3B2A] hover:bg-[#126B32]"
                        >
                            <Link href={crear()}>
                                <Plus className="size-5" strokeWidth={2.5} />
                                Nueva visita
                            </Link>
                        </Button>
                    </section>

                    <section
                        aria-label="Indicadores principales"
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {indicadores.map((indicador) => {
                            const Icon = indicador.icon;
                            return (
                                <article
                                    key={indicador.title}
                                    className="rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_4px_0_rgba(14,59,42,0.1),0_18px_26px_-22px_rgba(14,59,42,0.5)]"
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
                                            <p className="text-[16px] font-extrabold text-[#10281D]">
                                                {indicador.title}
                                            </p>
                                            <p className="mt-2 text-[32px] leading-none font-extrabold text-[#10281D]">
                                                {indicador.value}
                                            </p>
                                            <p className="mt-2 text-[15px] text-[#607665]">
                                                {indicador.description}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px]">
                        <div className="flex flex-col gap-2 border-b-2 border-dashed border-[#B5CAAE] pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-[15px] bg-[#E4F1DD] text-[#17803D]">
                                    <Filter
                                        className="size-5"
                                        strokeWidth={2.3}
                                    />
                                </span>
                                <div>
                                    <h2 className="text-[20px] font-extrabold text-[#10281D]">
                                        Filtros de búsqueda
                                    </h2>
                                    <p className="text-[15px] text-[#3E5547]">
                                        Consulta los registros disponibles en
                                        SIGRA.
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
                        <div className="mt-6 grid gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
                            <label className="flex min-w-0 flex-col gap-2 xl:col-span-2">
                                <span className="text-[15px] font-semibold text-[#10281D]">
                                    Buscar por número o productor
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#2F6A45]" />
                                    <Input
                                        value={busqueda}
                                        onChange={(event) =>
                                            setBusqueda(event.target.value)
                                        }
                                        placeholder="Buscar por número o productor"
                                        className="h-12 rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] pr-4 pl-12 text-[16px] text-[#10281D] placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30"
                                    />
                                </div>
                            </label>
                            <CampoSeleccion
                                label="Tipo de visita"
                                icon={ClipboardList}
                                value={tipoVisita}
                                onChange={setTipoVisita}
                                placeholder="Todos los tipos"
                                options={tiposVisita}
                            />
                            <CampoSeleccion
                                label="Extensionista"
                                icon={UserRound}
                                value={extensionista}
                                onChange={setExtensionista}
                                placeholder="Todos los extensionistas"
                                options={extensionistas}
                            />
                            <CampoSeleccion
                                label="Vereda"
                                icon={MapPin}
                                value={vereda}
                                onChange={setVereda}
                                placeholder="Todas las veredas"
                                options={veredas}
                            />
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D]">
                                    Fecha desde
                                </span>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#2F6A45]" />
                                    <Input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(event) =>
                                            setFechaDesde(event.target.value)
                                        }
                                        className="h-12 rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] pr-4 pl-12 text-[16px] text-[#10281D] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30"
                                    />
                                </div>
                            </label>
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D]">
                                    Fecha hasta
                                </span>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#2F6A45]" />
                                    <Input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(event) =>
                                            setFechaHasta(event.target.value)
                                        }
                                        className="h-12 rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] pr-4 pl-12 text-[16px] text-[#10281D] hover:border-[#17803D] focus-visible:border-[#17803D] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30"
                                    />
                                </div>
                            </label>
                            <CampoSeleccion
                                label="Estado"
                                icon={Filter}
                                value={estado}
                                onChange={setEstado}
                                placeholder="Todos los estados"
                                options={estados}
                            />
                        </div>
                    </section>

                    <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px]">
                        <div className="flex flex-col gap-3 border-b-2 border-dashed border-[#B5CAAE] pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-[22px] font-extrabold text-[#10281D]">
                                    Registros disponibles
                                </h2>
                                <p className="mt-1 text-[15px] text-[#3E5547]">
                                    Listado consolidado de visitas y registros
                                    asociados en SIGRA.
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center rounded-full bg-[#FFF4CC] px-4 py-2 text-[15px] font-extrabold text-[#665000]">
                                Datos de demostración
                            </span>
                        </div>
                        {registrosFiltrados.length > 0 ? (
                            <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                {registrosFiltrados.map((registro) => (
                                    <article
                                        key={registro.numero}
                                        className="rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] p-5 shadow-[0_4px_0_rgba(14,59,42,0.1),0_18px_26px_-22px_rgba(14,59,42,0.5)] sm:p-6"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-semibold text-[#3E5547]">
                                                    Número de visita
                                                </p>
                                                <h3 className="mt-1 text-[20px] font-extrabold text-[#10281D]">
                                                    {registro.numero}
                                                </h3>
                                            </div>
                                            <span
                                                className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-[15px] font-extrabold ${registro.estado === 'Completada' ? 'bg-[#E4F1DD] text-[#2F6A45]' : 'bg-[#FFF4CC] text-[#665000]'}`}
                                            >
                                                {registro.estado}
                                            </span>
                                        </div>
                                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-[15px] font-semibold text-[#3E5547]">
                                                    Productor
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold text-[#10281D]">
                                                    {registro.productor}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[15px] font-semibold text-[#3E5547]">
                                                    Extensionista
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold text-[#10281D]">
                                                    {registro.extensionista}
                                                </dd>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#2F6A45]" />
                                                <div>
                                                    <dt className="text-[15px] font-semibold text-[#3E5547]">
                                                        Fecha
                                                    </dt>
                                                    <dd className="mt-1 text-[16px] font-bold text-[#10281D]">
                                                        {registro.fecha}
                                                    </dd>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 size-5 shrink-0 text-[#2F6A45]" />
                                                <div>
                                                    <dt className="text-[15px] font-semibold text-[#3E5547]">
                                                        Vereda
                                                    </dt>
                                                    <dd className="mt-1 text-[16px] font-bold text-[#10281D]">
                                                        {registro.vereda}
                                                    </dd>
                                                </div>
                                            </div>
                                            <div>
                                                <dt className="text-[15px] font-semibold text-[#3E5547]">
                                                    Tipo de visita
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold text-[#10281D]">
                                                    {registro.tipoVisita}
                                                </dd>
                                            </div>
                                        </dl>
                                        <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-dashed border-[#B5CAAE] pt-5">
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setVisitaConAccionPendiente(
                                                        registro.numero,
                                                    )
                                                }
                                                className="min-h-11 rounded-[14px] bg-[#B45309] px-4 text-[15px] font-bold text-white shadow-[0_3px_0_#7F3605] hover:bg-[#92400E] focus-visible:ring-[4px] focus-visible:ring-[#B45309]/35"
                                            >
                                                <Pencil className="size-[18px]" />
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setVisitaConAccionPendiente(
                                                        registro.numero,
                                                    )
                                                }
                                                className="min-h-11 rounded-[14px] bg-[#DC2626] px-4 text-[15px] font-bold text-white shadow-[0_3px_0_#B91C1C] hover:bg-[#B91C1C] focus-visible:ring-[4px] focus-visible:ring-[#DC2626]/35"
                                            >
                                                <FileText className="size-[18px]" />
                                                PDF
                                            </Button>
                                        </div>
                                        {visitaConAccionPendiente ===
                                            registro.numero && (
                                            <p
                                                role="status"
                                                className="mt-4 text-[15px] font-semibold text-[#3E5547]"
                                            >
                                                Funcionalidad pendiente
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-[24px] border-[2px] border-dashed border-[#B5CAAE] bg-[#F7FBF4] px-6 py-10 text-center">
                                <h3 className="text-[20px] font-extrabold text-[#10281D]">
                                    No hay registros que coincidan con los
                                    filtros
                                </h3>
                                <p className="mt-2 text-[16px] leading-[1.5] text-[#3E5547]">
                                    Ajusta los criterios de búsqueda o limpia
                                    los filtros para ver los datos de
                                    demostración.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'SIGRA', href: dashboard() }] };
