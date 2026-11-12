import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    History,
    UserRound,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DetalleCambiosTrazabilidad } from '@/components/detalle-cambios-trazabilidad';
import type {
    VersionTrazabilidad,
    VisitaTrazabilidad,
} from '@/types/trazabilidad';

type Props = {
    visita: VisitaTrazabilidad | null;
    historial?: VersionTrazabilidad[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    returnFocusRef?: RefObject<HTMLButtonElement | null>;
};

export function TrazabilidadModal({
    visita,
    historial = [],
    open,
    onOpenChange,
    returnFocusRef,
}: Props) {
    const [versionesAbiertas, setVersionesAbiertas] = useState<Set<string>>(
        () => new Set(),
    );
    const versionesOrdenadas = [...historial].sort(
        (versionA, versionB) => versionB.numero - versionA.numero,
    );

    useEffect(() => {
        if (!open || !visita) {
            return;
        }

        setVersionesAbiertas(new Set());
    }, [open, visita?.numero]);

    const alternarVersion = (versionId: string) => {
        setVersionesAbiertas((versionesActuales) => {
            const siguientesVersiones = new Set(versionesActuales);

            if (siguientesVersiones.has(versionId)) {
                siguientesVersiones.delete(versionId);
            } else {
                siguientesVersiones.add(versionId);
            }

            return siguientesVersiones;
        });
    };

    return (
        <Dialog open={open && Boolean(visita)} onOpenChange={onOpenChange}>
            {visita && (
                <DialogContent
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        returnFocusRef?.current?.focus();
                    }}
                    className="flex max-h-[min(90vh,900px)] w-[calc(100%-1.5rem)] max-w-[1050px] flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)] sm:max-w-[1050px]"
                >
                    <DialogHeader className="shrink-0 border-b border-border px-5 py-5 pr-14 text-left sm:px-7">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_4px_0_#1747A5]">
                                <History className="size-5" strokeWidth={2.2} />
                            </span>
                            <div className="min-w-0">
                                <DialogTitle className="text-xl font-extrabold text-foreground sm:text-2xl">
                                    Trazabilidad de la visita
                                </DialogTitle>
                                <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Historial de registros y ediciones del
                                    formulario MI10-F58.
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="mt-5 grid min-w-0 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
                            <div className="min-w-0">
                                <p className="text-xs font-bold tracking-wide text-[#52645A] uppercase dark:text-[#C4D5C8]">
                                    Número de visita
                                </p>
                                <p className="mt-1 font-extrabold break-words text-foreground">
                                    {visita.numero}
                                </p>
                            </div>
                            <div className="flex min-w-0 items-start gap-2">
                                <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-wide text-[#52645A] uppercase dark:text-[#C4D5C8]">
                                        Productor
                                    </p>
                                    <p className="mt-1 font-semibold break-words text-foreground">
                                        {visita.productor}
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-start gap-2">
                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#52645A] dark:text-[#C4D5C8]" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-wide text-[#52645A] uppercase dark:text-[#C4D5C8]">
                                        Fecha de visita
                                    </p>
                                    <p className="mt-1 font-semibold break-words text-foreground">
                                        {visita.fecha}
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-start gap-2">
                                <UserRound className="mt-0.5 size-4 shrink-0 text-[#52645A] dark:text-[#C4D5C8]" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-wide text-[#52645A] uppercase dark:text-[#C4D5C8]">
                                        Extensionista
                                    </p>
                                    <p className="mt-1 font-semibold break-words text-foreground">
                                        {visita.extensionista}
                                    </p>
                                </div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold tracking-wide text-[#52645A] uppercase dark:text-[#C4D5C8]">
                                    Estado actual
                                </p>
                                <p className="mt-1 inline-flex items-center gap-1.5 font-extrabold text-[#17803D] dark:text-[#8ED19B]">
                                    <span className="size-2 rounded-full bg-current" />
                                    {visita.estado}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-7">
                        <div className="space-y-4">
                            <h2 className="text-lg font-extrabold text-foreground">
                                Historial de cambios
                            </h2>
                            {versionesOrdenadas.length > 0 ? (
                                <div className="relative space-y-4">
                                    {versionesOrdenadas.map(
                                        (version, index) => {
                                            const estaAbierta =
                                                versionesAbiertas.has(
                                                    version.id,
                                                );

                                            return (
                                                <div
                                                    key={version.id}
                                                    className="relative flex gap-3 sm:gap-4"
                                                >
                                                    <div className="relative flex w-9 shrink-0 justify-center">
                                                        {index <
                                                            versionesOrdenadas.length -
                                                                1 && (
                                                            <span className="absolute top-9 bottom-[-1rem] w-px bg-border" />
                                                        )}
                                                        <span className="z-10 flex size-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-extrabold text-white shadow-[0_3px_0_#1747A5]">
                                                            v{version.numero}
                                                        </span>
                                                    </div>
                                                    <article className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="text-base font-extrabold break-words text-foreground">
                                                                        {
                                                                            version.operacion
                                                                        }
                                                                    </h3>
                                                                    <span className="rounded-full bg-[#EEF2EE] px-2.5 py-1 text-xs font-bold text-[#40554A] dark:bg-[#2C3E32] dark:text-[#D9EBDD]">
                                                                        {
                                                                            version
                                                                                .cambios
                                                                                .length
                                                                        }{' '}
                                                                        {version
                                                                            .cambios
                                                                            .length ===
                                                                        1
                                                                            ? 'campo'
                                                                            : 'campos'}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 text-sm break-words text-[#52645A] dark:text-[#C4D5C8]">
                                                                    {
                                                                        version.usuario
                                                                    }{' '}
                                                                    ·{' '}
                                                                    {
                                                                        version.fechaHora
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    alternarVersion(
                                                                        version.id,
                                                                    )
                                                                }
                                                                aria-expanded={
                                                                    estaAbierta
                                                                }
                                                                aria-controls={`cambios-${version.id}`}
                                                                className="w-full shrink-0 rounded-xl border border-[#2563EB] bg-[#2563EB] text-white hover:border-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white focus-visible:ring-[4px] focus-visible:ring-[#2563EB]/35 focus-visible:ring-offset-2 sm:w-auto dark:border-[#2563EB] dark:bg-[#2563EB] dark:text-white dark:hover:border-[#1D4ED8] dark:hover:bg-[#1D4ED8] dark:hover:text-white"
                                                            >
                                                                {estaAbierta
                                                                    ? 'Ocultar cambios'
                                                                    : 'Ver cambios'}
                                                                {estaAbierta ? (
                                                                    <ChevronUp className="size-4" />
                                                                ) : (
                                                                    <ChevronDown className="size-4" />
                                                                )}
                                                            </Button>
                                                        </div>

                                                        {estaAbierta && (
                                                            <div
                                                                id={`cambios-${version.id}`}
                                                            >
                                                                <DetalleCambiosTrazabilidad
                                                                    cambios={
                                                                        version.cambios
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </article>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center">
                                    <p className="font-semibold text-foreground">
                                        No hay historial de cambios.
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Las modificaciones registradas
                                        aparecerán aquí.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}
