import { Head, Link, router, usePage } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
    CalendarDays,
    FileText,
    Phone,
    Save,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SigraSelect } from '@/components/ui/sigra-select';
import { cn } from '@/lib/utils';
import { index } from '@/routes/productores';

type PageProps = {
    productorId?: string;
    productor?: ProductorDirectorio | null;
};

type ProductorDirectorio = {
    id: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    fechaNacimiento: string;
    fechaNacimientoISO: string;
};

type FormValues = Pick<
    ProductorDirectorio,
    | 'nombres'
    | 'apellidos'
    | 'tipoDocumento'
    | 'numeroDocumento'
    | 'telefono'
    | 'fechaNacimientoISO'
>;

const inputClassName =
    'h-[50px] w-full rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] text-[16px] text-[#10281D] shadow-none outline-none placeholder:text-[15px] placeholder:text-[#5A6F61] hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30 dark:border-[#5E8068] dark:bg-[#24382A] dark:text-[#F0FFF3] dark:placeholder:text-[#AFC7B5] dark:focus:bg-[#294330]';

const documentTypes = [
    'Cédula de ciudadanía',
    'Tarjeta de identidad',
    'Cédula de extranjería',
    'Pasaporte',
];

function Campo({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon?: LucideIcon;
    children: ReactNode;
}) {
    return (
        <div className="min-w-0">
            <Label className="mb-2.5 block text-[15px] leading-[1.4] font-semibold text-[#10281D] dark:text-[#E5F3E8]">
                {label}
            </Label>
            <div className="relative">
                {Icon && (
                    <Icon className="pointer-events-none absolute top-1/2 left-[17px] z-10 size-5 -translate-y-1/2 text-[#2F6A45] dark:text-[#9DCEA8]" />
                )}
                {children}
            </div>
        </div>
    );
}

function Grupo({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[22px] border-[1.5px] border-[#D1E0CB] bg-[#F7FBF4] p-5 dark:border-[#3E5B46] dark:bg-[#22352A]">
            <div className="mb-5 flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#E4F1DD] text-[#17803D] dark:bg-[#294330] dark:text-[#A9D8AF]">
                    <Icon className="size-[18px]" strokeWidth={2} />
                </span>
                <h2 className="text-[17px] font-extrabold text-[#103F2D] dark:text-[#F0FFF3]">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}

export default function EditarProductor() {
    const { productor } = usePage<PageProps>().props;
    const [values, setValues] = useState<FormValues>(() =>
        productor
            ? {
                  nombres: productor.nombres,
                  apellidos: productor.apellidos,
                  tipoDocumento: productor.tipoDocumento,
                  numeroDocumento: productor.numeroDocumento,
                  telefono: productor.telefono,
                  fechaNacimientoISO: productor.fechaNacimientoISO,
              }
            : {
                  nombres: '', apellidos: '',
                  tipoDocumento: '',
                  numeroDocumento: '',
                  telefono: '',
                  fechaNacimientoISO: '',
              },
    );
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        if (!productor) {
            return;
        }

        setValues({
            nombres: productor.nombres, apellidos: productor.apellidos,
            tipoDocumento: productor.tipoDocumento,
            numeroDocumento: productor.numeroDocumento,
            telefono: productor.telefono,
            fechaNacimientoISO: productor.fechaNacimientoISO,
        });
        setMensaje('');
    }, [productor]);

    const setValue = <K extends keyof FormValues>(
        key: K,
        value: FormValues[K],
    ) => {
        setValues((current) => ({ ...current, [key]: value }));
        setMensaje('');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.put(`/productores/${productor!.id}`, { nombres: values.nombres, apellidos: values.apellidos, tipo_documento: values.tipoDocumento, numero_documento: values.numeroDocumento, telefono: values.telefono, fecha_nacimiento: values.fechaNacimientoISO }, { onSuccess: () => setMensaje('Cambios guardados correctamente.'), onError: () => setMensaje('Revisa los campos indicados antes de guardar.') });
    };

    if (!productor) {
        return (
            <>
                <Head title="Editar productor" />
                <main className="sigra-jakarta sigra-pulido min-w-0 flex-1 bg-[#DCE8D2] px-4 py-5 sm:px-8 sm:py-[26px] xl:px-10 dark:bg-[#14221A]">
                    <div className="mx-auto max-w-[1480px] rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-8 shadow-[0_6px_0_rgba(14,59,42,0.12)] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                        <p className="text-[16px] text-[#3E5547] dark:text-[#BFD9C5]">
                            No se encontró el productor solicitado.
                        </p>
                        <Button
                            asChild
                            className="mt-5 rounded-[14px] bg-[#17803D] text-white hover:bg-[#126B32]"
                        >
                            <Link href={index()}>Volver al directorio</Link>
                        </Button>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Head title="Editar productor" />
            <main
                className="sigra-jakarta sigra-pulido min-w-0 flex-1 bg-[#DCE8D2] px-4 py-5 pb-8 sm:px-8 sm:py-[26px] sm:pb-11 xl:px-10 dark:bg-[#14221A]"
                style={{
                    backgroundImage:
                        'radial-gradient(#B9CFB0 1.5px, transparent 1.7px)',
                    backgroundSize: '24px 24px',
                }}
            >
                <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
                    <section className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-6 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-[30px] dark:border-[#3E5B46] dark:bg-[#1B2A21]">
                        <div className="flex items-center gap-4">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#17803D] text-white shadow-[0_4px_0_#0E3B2A]">
                                <UsersRound
                                    className="size-7"
                                    strokeWidth={2}
                                />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-extrabold text-[#3E5547] dark:text-[#BFD9C5]">
                                    Gestión de productores
                                </p>
                                <h1 className="mt-1 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[#10281D] dark:text-[#F0FFF3]">
                                    Editar productor
                                </h1>
                                <p className="mt-1 text-[15px] leading-6 text-[#3E5547] dark:text-[#BFD9C5]">
                                    Actualiza la información de identificación y
                                    contacto del productor.
                                </p>
                            </div>
                        </div>
                    </section>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-[28px] border-[1.5px] border-[#B5CAAE] bg-white p-5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_22px_32px_-22px_rgba(14,59,42,0.55)] sm:p-7 dark:border-[#3E5B46] dark:bg-[#1B2A21]"
                    >
                        <div className="flex flex-col gap-4">
                            <Grupo title="Identificación" icon={FileText}>
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <Campo
                                        label="Nombres"
                                        icon={UserRound}
                                    >
                                        <Input
                                            value={values.nombres}
                                            onChange={(event) =>
                                                setValue(
                                                    'nombres',
                                                    event.target.value,
                                                )
                                            }
                                            className={cn(
                                                inputClassName,
                                                'pl-[52px]',
                                            )}
                                        />
                                    </Campo>
                                    <Campo label="Apellidos" icon={UserRound}>
                                        <Input value={values.apellidos} onChange={(event) => setValue('apellidos', event.target.value)} className={cn(inputClassName, 'pl-[52px]')} />
                                    </Campo>
                                    <Campo
                                        label="Tipo de documento"
                                        icon={FileText}
                                    >
                                        <SigraSelect
                                            id="tipo-documento-productor"
                                            value={values.tipoDocumento}
                                            onValueChange={(value) =>
                                                setValue('tipoDocumento', value)
                                            }
                                            placeholder="Seleccione..."
                                            options={documentTypes.map((type) => ({
                                                value: type,
                                                label: type,
                                            }))}
                                        />
                                    </Campo>
                                    <Campo
                                        label="Número de documento"
                                        icon={FileText}
                                    >
                                        <Input
                                            value={values.numeroDocumento}
                                            onChange={(event) =>
                                                setValue(
                                                    'numeroDocumento',
                                                    event.target.value,
                                                )
                                            }
                                            className={cn(
                                                inputClassName,
                                                'pl-[52px]',
                                            )}
                                        />
                                    </Campo>
                                </div>
                            </Grupo>

                            <Grupo
                                title="Datos personales y contacto"
                                icon={Phone}
                            >
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <Campo
                                        label="Número de teléfono"
                                        icon={Phone}
                                    >
                                        <Input
                                            type="tel"
                                            value={values.telefono}
                                            onChange={(event) =>
                                                setValue(
                                                    'telefono',
                                                    event.target.value,
                                                )
                                            }
                                            className={cn(
                                                inputClassName,
                                                'pl-[52px]',
                                            )}
                                        />
                                    </Campo>
                                    <Campo
                                        label="Fecha de nacimiento"
                                        icon={CalendarDays}
                                    >
                                        <Input
                                            type="date"
                                            value={values.fechaNacimientoISO}
                                            onChange={(event) =>
                                                setValue(
                                                    'fechaNacimientoISO',
                                                    event.target.value,
                                                )
                                            }
                                            className={cn(
                                                inputClassName,
                                                'pl-[52px]',
                                            )}
                                        />
                                    </Campo>
                                </div>
                            </Grupo>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t-2 border-dashed border-[#B5CAAE] pt-5 sm:flex-row sm:justify-end dark:border-[#3E5B46]">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="min-h-11 rounded-[14px] border-[#B5CAAE] px-5 text-[15px] font-bold text-[#253D2E] hover:bg-[#F7FBF4] dark:border-[#5E8068] dark:text-[#E5F3E8] dark:hover:bg-[#24382A]"
                            >
                                <Link href={index()}>
                                    <X className="size-[18px]" />
                                    Cancelar
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                className="min-h-11 rounded-[14px] bg-[#17803D] px-5 text-[15px] font-bold text-white shadow-[0_3px_0_#0E3B2A] hover:bg-[#126B32] focus-visible:ring-[4px] focus-visible:ring-[#17803D]/35"
                            >
                                <Save className="size-[18px]" />
                                Guardar cambios
                            </Button>
                        </div>
                        {mensaje && (
                            <p
                                role="status"
                                className="mt-4 rounded-[14px] border border-dashed border-[#B5CAAE] bg-[#F7FBF4] px-4 py-3 text-sm text-[#3E5547] dark:border-[#3E5B46] dark:bg-[#22352A] dark:text-[#BFD9C5]"
                            >
                                {mensaje}
                            </p>
                        )}
                    </form>
                </div>
            </main>
        </>
    );
}

EditarProductor.layout = {
    breadcrumbs: [
        {
            title: 'Productores',
            href: index(),
        },
        {
            title: 'Editar productor',
            href: '#',
        },
    ],
};
