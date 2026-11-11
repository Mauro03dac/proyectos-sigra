import { usePage } from '@inertiajs/react';
import { Leaf } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo({
    variant = 'default',
}: {
    variant?: 'default' | 'sidebar';
}) {
    const { name } = usePage().props;

    if (variant === 'sidebar') {
        return (
            <>
                <div className="flex size-11 -rotate-[5deg] items-center justify-center rounded-[15px] bg-[#C8EA6B] text-[#0E3B2A] shadow-[0_4px_0_#7FA02E]">
                    <Leaf className="size-6" strokeWidth={2.2} />
                </div>
                <div className="ml-0 grid flex-1 text-left">
                    <span className="truncate text-[24px] leading-tight font-extrabold tracking-[0.03em] text-white">
                        SIGRA
                    </span>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
