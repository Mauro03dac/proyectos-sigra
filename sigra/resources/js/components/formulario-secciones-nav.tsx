import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type FormularioSeccion = {
    id: string;
    label: string;
    number: number;
    colorClass: string;
};

type FormularioSeccionesNavProps = {
    sections: readonly FormularioSeccion[];
};

export function FormularioSeccionesNav({
    sections,
}: FormularioSeccionesNavProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

    useEffect(() => {
        const elements = sections
            .map((section) => document.getElementById(section.id))
            .filter((element): element is HTMLElement => element !== null);

        if (elements.length === 0) return;

        const actualizarSeccionActiva = () => {
            const lineaActiva = window.innerHeight * 0.28;
            const visibles = elements.filter((element) => {
                const rect = element.getBoundingClientRect();

                return rect.top <= lineaActiva && rect.bottom > lineaActiva;
            });

            if (visibles.length > 0) {
                setActiveSection(visibles[visibles.length - 1].id);
            }
        };

        const observer = new IntersectionObserver(actualizarSeccionActiva, {
            threshold: [0, 0.15, 0.5, 1],
        });

        elements.forEach((element) => observer.observe(element));
        actualizarSeccionActiva();

        return () => observer.disconnect();
    }, [sections]);

    return (
        <nav
            aria-label="Secciones del formulario"
            className="flex gap-2.5 overflow-x-auto px-0.5 pb-2.5"
        >
            {sections.map((section) => {
                const isActive = activeSection === section.id;

                return (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        aria-current={isActive ? 'step' : undefined}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                            'inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border-[1.5px] border-[#B5CAAE] bg-white px-5 pl-2 text-[15px] font-extrabold text-[#10281D] shadow-[0_3px_0_rgba(14,59,42,0.14)] transition hover:-translate-y-px hover:border-[#17803D] focus-visible:ring-[4px] focus-visible:ring-[#4E9A2B]/30 focus-visible:outline-none',
                            isActive &&
                                'border-[#17803D] shadow-[0_4px_0_#0E3B2A]',
                        )}
                    >
                        <b
                            className={cn(
                                'inline-flex size-8 items-center justify-center rounded-full text-[15px]',
                                section.colorClass,
                            )}
                        >
                            {section.number}
                        </b>
                        {section.label}
                    </a>
                );
            })}
        </nav>
    );
}
