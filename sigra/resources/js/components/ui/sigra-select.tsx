import { Check, ChevronDown, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { cn } from '@/lib/utils';

type Opcion = { value: string; label: string; group?: string };

const EVENTO_SELECTOR_ABIERTO = 'sigra:selector-abierto';

type SigraSelectProps = {
    icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
    options: Opcion[];
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    id?: string;
    name?: string;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    required?: boolean;
    disabled?: boolean;
};

export function SigraSelect({
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
    disabled = false,
}: SigraSelectProps) {
    const generatedId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const selectorId = id ?? generatedId;
    const [abierto, setAbierto] = useState(false);
    const [seleccion, setSeleccion] = useState(value ?? '');
    const [busqueda, setBusqueda] = useState('');
    const [indiceActivo, setIndiceActivo] = useState(0);
    const [posicion, setPosicion] = useState({ top: 0, left: 0, width: 0 });
    const usaBuscador = options.length > 8;
    const opcionesVisibles = options.filter((opcion) =>
        opcion.label.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es')),
    );
    const seleccionada = options.find((opcion) => opcion.value === seleccion);

    useEffect(() => {
        const cerrarOtroSelector = (event: Event) => {
            const detalle = (event as CustomEvent<string>).detail;
            if (detalle !== selectorId) {
                setAbierto(false);
                setBusqueda('');
            }
        };

        window.addEventListener(EVENTO_SELECTOR_ABIERTO, cerrarOtroSelector);

        return () => {
            window.removeEventListener(
                EVENTO_SELECTOR_ABIERTO,
                cerrarOtroSelector,
            );
        };
    }, [selectorId]);

    useEffect(() => {
        if (!abierto) return;

        const cerrarAlHacerClicFuera = (event: PointerEvent) => {
            const objetivo = event.target as Node;
            if (
                !triggerRef.current?.contains(objetivo) &&
                !menuRef.current?.contains(objetivo)
            ) {
                setAbierto(false);
                setBusqueda('');
            }
        };
        const cerrarConEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setAbierto(false);
                setBusqueda('');
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', cerrarAlHacerClicFuera);
        document.addEventListener('keydown', cerrarConEscape);

        return () => {
            document.removeEventListener('pointerdown', cerrarAlHacerClicFuera);
            document.removeEventListener('keydown', cerrarConEscape);
        };
    }, [abierto]);

    useEffect(() => {
        if (value !== undefined) {
            setSeleccion(value);
        }
    }, [value]);

    useEffect(() => {
        const indiceSeleccionado = opcionesVisibles.findIndex(
            (opcion) => opcion.value === seleccion,
        );
        setIndiceActivo(indiceSeleccionado >= 0 ? indiceSeleccionado : 0);
    }, [busqueda, seleccion]);

    useEffect(() => {
        if (abierto && !usaBuscador) {
            optionRefs.current[indiceActivo]?.focus();
        }
    }, [abierto, indiceActivo, usaBuscador]);

    useEffect(() => {
        if (!abierto || !triggerRef.current) return;

        const actualizarPosicion = () => {
            const rectangulo = triggerRef.current?.getBoundingClientRect();
            if (!rectangulo) return;
            setPosicion({
                top: rectangulo.bottom + 6,
                left: rectangulo.left,
                width: rectangulo.width,
            });
        };

        actualizarPosicion();
        window.addEventListener('resize', actualizarPosicion);
        window.addEventListener('scroll', actualizarPosicion, true);

        return () => {
            window.removeEventListener('resize', actualizarPosicion);
            window.removeEventListener('scroll', actualizarPosicion, true);
        };
    }, [abierto]);

    const abrir = () => {
        window.dispatchEvent(
            new CustomEvent(EVENTO_SELECTOR_ABIERTO, { detail: selectorId }),
        );
        setBusqueda('');
        setAbierto(true);
    };

    const cerrar = () => {
        setAbierto(false);
        setBusqueda('');
        triggerRef.current?.focus();
    };

    const seleccionar = (valor: string) => {
        setSeleccion(valor);
        onValueChange?.(valor);
        cerrar();
    };

    return (
        <>
            <select
                id={`${selectorId}-value`}
                name={name}
                value={seleccion}
                required={required}
                disabled={disabled}
                onChange={(event) => {
                    setSeleccion(event.target.value);
                    onValueChange?.(event.target.value);
                }}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button
                ref={triggerRef}
                id={selectorId}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={abierto}
                aria-labelledby={ariaLabelledby}
                aria-required={ariaRequired}
                aria-controls={`${id ?? generatedId}-listbox`}
                onClick={() => (abierto ? cerrar() : abrir())}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (!abierto) {
                            abrir();
                            return;
                        }
                        setIndiceActivo((indice) =>
                            Math.min(indice + 1, opcionesVisibles.length - 1),
                        );
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setIndiceActivo((indice) => Math.max(indice - 1, 0));
                    } else if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (!abierto) {
                            abrir();
                        } else if (opcionesVisibles[indiceActivo]) {
                            seleccionar(opcionesVisibles[indiceActivo].value);
                        }
                    }
                }}
                className={cn(
                    'relative flex h-[50px] w-full items-center rounded-[16px] border-[1.5px] border-[#6F9479] bg-[#F7FBF4] px-[18px] pr-12 text-left text-[16px] text-[#10281D] transition outline-none hover:border-[#17803D] focus:border-[#17803D] focus:bg-white focus:ring-[4px] focus:ring-[#4E9A2B]/30',
                    Icon && 'pl-[52px]',
                    disabled &&
                        'cursor-not-allowed border-[#557A62] bg-[#F0F8EC] text-[#355443] opacity-100 hover:border-[#557A62] dark:bg-[#24382A] dark:text-[#BFD9C5]',
                )}
            >
                {Icon && <Icon className="pointer-events-none absolute left-[17px] size-5 text-[#2F6A45]" strokeWidth={1.9} />}
                <span className={cn('truncate', !seleccionada && 'text-[#5A6F61]')}>
                    {seleccionada?.label ?? placeholder}
                </span>
                <ChevronDown className="pointer-events-none absolute right-[14px] size-[18px] text-[#17803D]" strokeWidth={2.6} />
            </button>
            {abierto &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={menuRef}
                        id={`${selectorId}-listbox`}
                        role="listbox"
                        aria-labelledby={selectorId}
                        className="fixed z-[100] overflow-hidden rounded-[16px] border-[1.5px] border-[#6F9479] bg-white p-1.5 shadow-[0_6px_0_rgba(14,59,42,0.12),0_18px_26px_-20px_rgba(14,59,42,0.55)]"
                        style={{ top: posicion.top, left: posicion.left, width: posicion.width }}
                    >
                        {usaBuscador && (
                            <label className="relative mb-1 block">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#2F6A45]" />
                                <input
                                    autoFocus
                                    value={busqueda}
                                    onChange={(event) => setBusqueda(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Tab') {
                                            cerrar();
                                            return;
                                        }
                                        if (event.key === 'ArrowDown') {
                                            event.preventDefault();
                                            optionRefs.current[0]?.focus();
                                        }
                                    }}
                                    placeholder="Buscar..."
                                    className="h-10 w-full rounded-[12px] border border-[#B5CAAE] bg-[#F7FBF4] pr-3 pl-9 text-[14px] text-[#10281D] outline-none focus:border-[#17803D] focus:bg-white focus:ring-2 focus:ring-[#4E9A2B]/30"
                                />
                            </label>
                        )}
                        <div className="max-h-60 overflow-y-auto overscroll-contain">
                            {opcionesVisibles.map((option, index) => (
                                <div key={option.value}>
                                    {option.group &&
                                        (index === 0 || option.group !== opcionesVisibles[index - 1]?.group) && (
                                            <div
                                                role="presentation"
                                                className="px-3 pt-2.5 pb-1 text-[12px] font-extrabold tracking-[0.04em] text-[#5A6F61] uppercase"
                                            >
                                                {option.group}
                                            </div>
                                        )}
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={seleccion === option.value}
                                        ref={(element) => {
                                            optionRefs.current[index] = element;
                                        }}
                                        onMouseEnter={() => setIndiceActivo(index)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Tab') {
                                                cerrar();
                                                return;
                                            }
                                            if (event.key === 'ArrowDown') {
                                                event.preventDefault();
                                                setIndiceActivo((indice) =>
                                                    Math.min(indice + 1, opcionesVisibles.length - 1),
                                                );
                                                optionRefs.current[
                                                    Math.min(index + 1, opcionesVisibles.length - 1)
                                                ]?.focus();
                                            } else if (event.key === 'ArrowUp') {
                                                event.preventDefault();
                                                if (index === 0) {
                                                    triggerRef.current?.focus();
                                                    return;
                                                }
                                                optionRefs.current[index - 1]?.focus();
                                            } else if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                seleccionar(option.value);
                                            }
                                        }}
                                        onClick={() => seleccionar(option.value)}
                                        className={cn(
                                            'flex min-h-10 w-full items-center justify-between gap-3 rounded-[11px] px-3 py-2 text-left text-[15px] text-[#10281D] outline-none transition-colors duration-150 motion-reduce:transition-none hover:bg-[#E4F1DD] focus:bg-[#E4F1DD] focus-visible:ring-2 focus-visible:ring-[#4E9A2B]/50',
                                            (seleccion === option.value || indiceActivo === index) && 'bg-[#E4F1DD] font-semibold',
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {seleccion === option.value && <Check className="size-4 shrink-0 text-[#17803D]" strokeWidth={3} />}
                                    </button>
                                </div>
                            ))}
                            {opcionesVisibles.length === 0 && (
                                <p className="px-3 py-3 text-[14px] text-[#3E5547]">No hay resultados.</p>
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
