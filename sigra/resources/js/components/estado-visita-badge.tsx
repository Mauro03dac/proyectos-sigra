type EstadoVisitaBadgeProps = {
    estado: string;
    etiqueta: string;
};

const clasesBase =
    'inline-flex w-fit items-center rounded-full px-4 py-2 text-[15px] font-extrabold';

export function EstadoVisitaBadge({
    estado,
    etiqueta,
}: EstadoVisitaBadgeProps) {
    const clasesEstado =
        estado === 'registrado'
            ? 'bg-[#E4F1DD] text-[#2F6A45]'
            : estado === 'borrador'
              ? 'bg-[#FFF4CC] text-[#665000]'
              : '';

    return <span className={`${clasesBase} ${clasesEstado}`}>{etiqueta}</span>;
}
