import type { CambioTrazabilidad } from '@/types/trazabilidad';

const umbralTextoLargo = 140;

function esTextoLargo(valor: string): boolean {
    return valor.length > umbralTextoLargo || /\r?\n/.test(valor);
}

function ValorCambio({
    etiqueta,
    valor,
    variante,
}: {
    etiqueta: string;
    valor: string;
    variante: 'anterior' | 'nuevo';
}) {
    return (
        <div
            className={
                variante === 'nuevo'
                    ? 'min-w-0 rounded-xl border border-[#17803D]/30 bg-[#E4F1DD] p-3 dark:border-[#65B874]/50 dark:bg-[#1F4329]'
                    : 'min-w-0 rounded-xl border border-[#CCD8D0] bg-[#F1F4F2] p-3 dark:border-[#54695B] dark:bg-[#28352D]'
            }
        >
            <p
                className={
                    variante === 'nuevo'
                        ? 'mb-1 text-xs font-bold tracking-wide text-[#27683A] uppercase dark:text-[#B9E8C0]'
                        : 'mb-1 text-xs font-bold tracking-wide text-[#456052] uppercase dark:text-[#D4E6D8]'
                }
            >
                {etiqueta}
            </p>
            <p
                className={
                    variante === 'nuevo'
                        ? 'text-sm font-semibold break-words whitespace-pre-wrap text-[#126B32] dark:text-[#C9F2CE]'
                        : 'text-sm break-words whitespace-pre-wrap text-[#27362E] dark:text-[#F0FFF3]'
                }
            >
                {valor}
            </p>
        </div>
    );
}

function CambioCorto({ cambio }: { cambio: CambioTrazabilidad }) {
    return (
        <div className="grid min-w-0 gap-3 rounded-xl border border-border p-3 sm:grid-cols-[minmax(10rem,1.15fr)_minmax(0,1.4fr)_minmax(0,1.4fr)] sm:items-start sm:gap-4">
            <div className="min-w-0 text-sm font-bold break-words whitespace-pre-wrap text-foreground">
                {cambio.etiqueta}
            </div>
            <ValorCambio
                etiqueta="Anterior"
                valor={cambio.anterior}
                variante="anterior"
            />
            <ValorCambio
                etiqueta="Nuevo"
                valor={cambio.nuevo}
                variante="nuevo"
            />
        </div>
    );
}

function CambioLargo({ cambio }: { cambio: CambioTrazabilidad }) {
    return (
        <article className="rounded-xl border border-border p-4">
            <h4 className="mb-3 text-sm font-bold break-words whitespace-pre-wrap text-foreground">
                {cambio.etiqueta}
            </h4>
            <div className="grid gap-4">
                <ValorCambio
                    etiqueta="Anterior"
                    valor={cambio.anterior}
                    variante="anterior"
                />
                <ValorCambio
                    etiqueta="Nuevo"
                    valor={cambio.nuevo}
                    variante="nuevo"
                />
            </div>
        </article>
    );
}

export function DetalleCambiosTrazabilidad({
    cambios,
}: {
    cambios: CambioTrazabilidad[];
}) {
    const cambiosCortos = cambios.filter(
        (cambio) =>
            !esTextoLargo(cambio.anterior) && !esTextoLargo(cambio.nuevo),
    );
    const cambiosLargos = cambios.filter(
        (cambio) => esTextoLargo(cambio.anterior) || esTextoLargo(cambio.nuevo),
    );

    return (
        <div className="space-y-3 border-t border-border pt-4">
            {cambiosCortos.length > 0 && (
                <section
                    aria-label="Campos con valores cortos"
                    className="space-y-2"
                >
                    <div className="hidden grid-cols-[minmax(10rem,1.15fr)_minmax(0,1.4fr)_minmax(0,1.4fr)] gap-4 px-3 text-xs font-bold tracking-wide text-[#52645A] uppercase sm:grid dark:text-[#C4D5C8]">
                        <span>Campo</span>
                        <span>Valor anterior</span>
                        <span>Valor nuevo</span>
                    </div>
                    {cambiosCortos.map((cambio) => (
                        <CambioCorto key={cambio.campo} cambio={cambio} />
                    ))}
                </section>
            )}

            {cambiosLargos.length > 0 && (
                <section
                    aria-label="Campos con textos extensos"
                    className="space-y-2"
                >
                    {cambiosLargos.map((cambio) => (
                        <CambioLargo key={cambio.campo} cambio={cambio} />
                    ))}
                </section>
            )}
        </div>
    );
}
