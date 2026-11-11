import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Filter,
    Pencil,
    Phone,
    Search,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { editar, index } from '@/routes/productores';
import { productoresDirectorioDemostracion } from './datos-demostracion';

const productoresPorPagina = 2;

const controlClassName =
    'h-12 w-full rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-4 text-[16px] text-[#10281D] outline-none transition hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:focus:bg-[#294330]';

export default function ListadoProductores() {
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [pagina, setPagina] = useState(1);

    const productoresFiltrados = useMemo(() => {
        const nombreNormalizado = nombre.trim().toLocaleLowerCase();
        const documentoNormalizado = documento.trim().toLocaleLowerCase();

        return productoresDirectorioDemostracion.filter((productor) => {
            return (
                productor.nombreCompleto
                    .toLocaleLowerCase()
                    .includes(nombreNormalizado) &&
                productor.numeroDocumento
                    .toLocaleLowerCase()
                    .includes(documentoNormalizado)
            );
        });
    }, [documento, nombre]);

    useEffect(() => {
        setPagina(1);
    }, [documento, nombre]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(productoresFiltrados.length / productoresPorPagina),
    );
    const paginaActual = Math.min(pagina, totalPaginas);
    const productoresVisibles = productoresFiltrados.slice(
        (paginaActual - 1) * productoresPorPagina,
        paginaActual * productoresPorPagina,
    );

    const limpiarFiltros = () => {
        setNombre('');
        setDocumento('');
    };

    return (
        <>
            <Head title="Directorio de productores" />
            <main
                className="sigra-jakarta sigra-pulido min-w-0 flex-1 bg-[#DCE8D2] px-4 py-5 pb-8 sm:px-8 sm:py-[26px] sm:pb-11 xl:px-10 dark:bg-[#14221A]"
                style={{
                    backgroundImage:
                        'radial-gradient(#B9CFB0 1.5px, transparent 1.7px)',
                    backgroundSize: '24px 24px',
                }}
            >
                <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
                    <section className="flex flex-col gap-5 rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px] lg:flex-row lg:items-center lg:justify-between dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                        <div className="min-w-0">
                            <div className="mb-3 flex items-center gap-3">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#17803D] text-white shadow-[0_4px_0_#0E3B2A]">
                                    <UsersRound
                                        className="size-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <span className="text-[15px] font-extrabold text-[#3E5547] dark:text-[#BFD9C5]">
                                    Gestión de productores
                                </span>
                            </div>
                            <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.03em] text-[#10281D] dark:text-[#F0FFF3]">
                                Directorio de productores
                            </h1>
                            <p className="mt-2 max-w-3xl text-[16px] leading-[1.5] text-[#3E5547] dark:text-[#BFD9C5]">
                                Consulta y administra la información de
                                identificación y contacto de los productores
                                registrados en SIGRA.
                            </p>
                        </div>
                        <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-[#FFF4CC] px-4 py-2 text-[14px] font-extrabold text-[#665000]">
                            Datos de demostración
                        </span>
                    </section>

                    <section
                        aria-label="Indicador de productores"
                        className="grid gap-5"
                    >
                        <article className="rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_4px_0_rgba(14,59,42,0.1),0_18px_26px_-22px_rgba(14,59,42,0.5)] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                            <div className="flex items-start gap-4">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#17803D] text-white shadow-[0_3px_0_rgba(14,59,42,0.18)]">
                                    <UsersRound
                                        className="size-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <div>
                                    <p className="text-[16px] font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                        Total de productores
                                    </p>
                                    <p className="mt-2 text-[32px] leading-none font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                        {
                                            productoresDirectorioDemostracion.length
                                        }
                                    </p>
                                    <p className="mt-2 text-[15px] text-[#607665] dark:text-[#BFD9C5]">
                                        Productores registrados
                                    </p>
                                </div>
                            </div>
                        </article>
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
                                        Combina los criterios para consultar
                                        productores.
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

                        <div className="mt-6 grid gap-5 lg:grid-cols-2">
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                                    Nombre del productor
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#2F6A45] dark:text-[#9DCEA8]" />
                                    <Input
                                        value={nombre}
                                        onChange={(event) =>
                                            setNombre(event.target.value)
                                        }
                                        placeholder="Ingrese el nombre completo"
                                        className={`${controlClassName} pr-4 pl-12 placeholder:text-[15px] placeholder:text-[#5A6F61] dark:placeholder:text-[#AFC7B5]`}
                                    />
                                </div>
                            </label>
                            <label className="flex min-w-0 flex-col gap-2">
                                <span className="text-[15px] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                                    Número de documento
                                </span>
                                <Input
                                    value={documento}
                                    onChange={(event) =>
                                        setDocumento(event.target.value)
                                    }
                                    placeholder="Ingrese el número de documento"
                                    className={`${controlClassName} placeholder:text-[15px] placeholder:text-[#5A6F61] dark:placeholder:text-[#AFC7B5]`}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                        <div className="flex flex-col gap-3 border-b-2 border-dashed border-[#B5CAAE] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#3E5B46]">
                            <div>
                                <h2 className="text-[22px] font-extrabold text-[#10281D] dark:text-[#F0FFF3]">
                                    Productores registrados
                                </h2>
                                <p className="mt-1 text-[15px] text-[#3E5547] dark:text-[#BFD9C5]">
                                    Información de identificación y contacto.
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center rounded-full bg-[#FFF4CC] px-4 py-2 text-[14px] font-extrabold text-[#665000]">
                                Datos de demostración
                            </span>
                        </div>

                        {productoresVisibles.length > 0 ? (
                            <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                {productoresVisibles.map((productor) => (
                                    <article
                                        key={productor.id}
                                        className="min-w-0 rounded-[24px] border-[1.5px] border-[#B5CAAE] bg-[#F7FBF4] p-5 shadow-[0_4px_0_rgba(14,59,42,0.1),0_18px_26px_-22px_rgba(14,59,42,0.5)] sm:p-6 dark:border-[#3E5B46] dark:bg-[#22352A]"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E4F1DD] text-[#17803D] dark:bg-[#294330] dark:text-[#A9D8AF]">
                                                <UserRound className="size-5" />
                                            </span>
                                            <h3 className="min-w-0 pt-1 text-[20px] font-extrabold break-words text-[#10281D] dark:text-[#F0FFF3]">
                                                {productor.nombreCompleto}
                                            </h3>
                                        </div>

                                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                                            <div className="min-w-0">
                                                <dt className="text-[14px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                    Tipo de documento
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold break-words text-[#10281D] dark:text-[#F0FFF3]">
                                                    {productor.tipoDocumento}
                                                </dd>
                                            </div>
                                            <div className="min-w-0">
                                                <dt className="text-[14px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                    Número de documento
                                                </dt>
                                                <dd className="mt-1 text-[16px] font-bold break-words text-[#10281D] dark:text-[#F0FFF3]">
                                                    {productor.numeroDocumento}
                                                </dd>
                                            </div>
                                            <div className="flex min-w-0 items-start gap-3">
                                                <Phone className="mt-0.5 size-5 shrink-0 text-[#2F6A45] dark:text-[#9DCEA8]" />
                                                <div className="min-w-0">
                                                    <dt className="text-[14px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                        Número de teléfono
                                                    </dt>
                                                    <dd className="mt-1 text-[16px] font-bold break-words text-[#10281D] dark:text-[#F0FFF3]">
                                                        {productor.telefono}
                                                    </dd>
                                                </div>
                                            </div>
                                            <div className="flex min-w-0 items-start gap-3">
                                                <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#2F6A45] dark:text-[#9DCEA8]" />
                                                <div className="min-w-0">
                                                    <dt className="text-[14px] font-semibold text-[#3E5547] dark:text-[#BFD9C5]">
                                                        Fecha de nacimiento
                                                    </dt>
                                                    <dd className="mt-1 text-[16px] font-bold break-words text-[#10281D] dark:text-[#F0FFF3]">
                                                        {
                                                            productor.fechaNacimiento
                                                        }
                                                    </dd>
                                                </div>
                                            </div>
                                        </dl>

                                        <div className="mt-6 flex justify-end border-t-2 border-dashed border-[#B5CAAE] pt-5 dark:border-[#3E5B46]">
                                            <Button
                                                asChild
                                                className="min-h-11 rounded-[14px] bg-[#B45309] px-5 text-[15px] font-bold text-white shadow-[0_3px_0_#7F3605] hover:bg-[#92400E] focus-visible:ring-[4px] focus-visible:ring-[#B45309]/35"
                                            >
                                                <Link
                                                    href={editar(productor.id)}
                                                >
                                                    <Pencil className="size-[18px]" />
                                                    Editar
                                                </Link>
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-6 rounded-2xl border border-dashed border-[#B5CAAE] bg-[#F7FBF4] px-5 py-8 text-center text-[15px] text-[#607665] dark:border-[#3E5B46] dark:bg-[#22352A] dark:text-[#BFD9C5]">
                                No hay productores que coincidan con los filtros
                                seleccionados.
                            </p>
                        )}

                        <div className="mt-6 flex flex-col gap-4 border-t-2 border-dashed border-[#B5CAAE] pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#3E5B46]">
                            <p className="text-[15px] text-[#607665] dark:text-[#BFD9C5]">
                                Mostrando {productoresVisibles.length} de{' '}
                                {productoresFiltrados.length} productores
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    disabled={paginaActual <= 1}
                                    onClick={() => setPagina(paginaActual - 1)}
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
                                    onClick={() => setPagina(paginaActual + 1)}
                                    variant="outline"
                                    aria-label="Página siguiente"
                                    className="size-11 rounded-[14px] border-[#B5CAAE] p-0"
                                >
                                    <ChevronRight className="size-5" />
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

ListadoProductores.layout = {
    breadcrumbs: [
        {
            title: 'Productores',
            href: index(),
        },
    ],
};
