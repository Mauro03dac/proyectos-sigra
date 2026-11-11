import { usePage } from '@inertiajs/react';
import { Bell, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const isVisitaExtensionismo =
        page.component === 'visitas-extensionismo/crear';

    return (
        <header
            className={cn(
                'sigra-jakarta flex min-h-16 shrink-0 items-center justify-between gap-4 px-4 py-3 transition-[width,height] ease-linear sm:px-8 xl:px-10',
                isVisitaExtensionismo
                    ? 'bg-[#DCE8D2] text-[#10281D] dark:bg-background dark:text-foreground [&_[data-slot=breadcrumb-link]]:text-[#3E5547] dark:[&_[data-slot=breadcrumb-link]]:text-muted-foreground [&_[data-slot=breadcrumb-page]]:font-extrabold [&_[data-slot=breadcrumb-page]]:text-[#10281D] dark:[&_[data-slot=breadcrumb-page]]:text-foreground'
                    : 'bg-[#F3F5EF] dark:bg-background dark:text-foreground',
            )}
        >
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 md:hidden" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {auth.user && (
                <div className="flex shrink-0 items-center gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Notificaciones"
                        className={cn(
                            'size-11 bg-white text-[#10281D] dark:border-border dark:bg-card dark:text-card-foreground',
                            isVisitaExtensionismo
                                ? 'rounded-[16px] border-[1.5px] border-[#B5CAAE] shadow-[0_3px_0_rgba(14,59,42,0.12)] hover:bg-[#EEF6EA]'
                                : 'rounded-[12px] border-[#E1E7DD] text-[#33433A] hover:bg-[#F3F5EF] dark:border-border dark:text-card-foreground dark:hover:bg-accent',
                        )}
                    >
                        <Bell className="size-5" strokeWidth={1.8} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                aria-label={`Abrir menú de usuario de ${auth.user.name}`}
                                className={cn(
                                    'min-h-11 rounded-full bg-white px-3 pl-1.5 text-sm font-semibold dark:border-border dark:bg-card dark:text-card-foreground',
                                    isVisitaExtensionismo
                                        ? 'border-[1.5px] border-[#B5CAAE] text-[#10281D] shadow-[0_3px_0_rgba(14,59,42,0.12)] hover:bg-[#EEF6EA]'
                                        : 'border-[#E1E7DD] text-[#33433A] hover:bg-[#F3F5EF] dark:border-border dark:text-card-foreground dark:hover:bg-accent',
                                )}
                            >
                                <Avatar className="size-8">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback
                                        className={cn(
                                            'text-xs font-extrabold text-white',
                                            isVisitaExtensionismo
                                                ? 'bg-[#17803D]'
                                                : 'bg-[#1F7A45]',
                                        )}
                                    >
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">
                                    {auth.user.name}
                                </span>
                                <ChevronDown className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </header>
    );
}
