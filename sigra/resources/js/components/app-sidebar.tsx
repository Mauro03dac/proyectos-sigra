import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    LayoutGrid,
    UserRound,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as productoresIndex } from '@/routes/productores';
import { index } from '@/routes/visitas-extensionismo';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Visitas de extensionismo',
        href: index(),
        icon: ClipboardList,
    },
    {
        title: 'RUEA',
        href: '/registro-ruea',
        icon: FileText,
    },
    {
        title: 'Registro del productor',
        href: '/registro-productor',
        icon: UserRound,
    },
    {
        title: 'Productores',
        href: productoresIndex(),
        icon: UsersRound,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="sigra-jakarta [--sidebar-width:280px] [&_[data-sidebar=menu-button]]:focus-visible:ring-[#C8EA6B]/70 [&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:overflow-hidden [&_[data-sidebar=sidebar]]:bg-[#0E3B2A] [&_[data-sidebar=sidebar]]:text-[#D3E8D6] [&_[data-slot=sidebar-content]]:relative [&_[data-slot=sidebar-content]]:z-10 [&_[data-slot=sidebar-footer]]:relative [&_[data-slot=sidebar-footer]]:z-10 [&_[data-slot=sidebar-footer]]:gap-2 [&_[data-slot=sidebar-footer]]:p-4 [&_[data-slot=sidebar-footer]_[data-slot=sidebar-menu-button]]:!text-[#D3E8D6] [&_[data-slot=sidebar-group-label]]:hidden [&_[data-slot=sidebar-header]]:relative [&_[data-slot=sidebar-header]]:z-10 [&_[data-slot=sidebar-header]]:mb-[30px] [&_[data-slot=sidebar-header]]:px-4 [&_[data-slot=sidebar-header]]:pt-[26px] [&_[data-slot=sidebar-header]]:pb-0 [&_[data-slot=sidebar-menu-button]]:min-h-[46px] [&_[data-slot=sidebar-menu-button]]:rounded-[16px] [&_[data-slot=sidebar-menu-button]]:px-[14px] [&_[data-slot=sidebar-menu-button]]:text-[15px] [&_[data-slot=sidebar-menu-button]]:font-semibold [&_[data-slot=sidebar-menu-button]]:text-[#D3E8D6] [&_[data-slot=sidebar-menu-button]]:hover:bg-white/9 [&_[data-slot=sidebar-menu-button]]:hover:text-white [&_[data-slot=sidebar-menu-button]>svg]:size-5 [&_[data-slot=sidebar-menu-button][data-active=true]]:bg-[#17803D] [&_[data-slot=sidebar-menu-button][data-active=true]]:font-semibold [&_[data-slot=sidebar-menu-button][data-active=true]]:text-white [&_[data-slot=sidebar-menu-button][data-active=true]]:shadow-[0_4px_0_rgba(0,0,0,0.28)] [&_[data-slot=sidebar-menu]]:gap-[5px]"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 280 300"
                className="pointer-events-none absolute -bottom-5 -left-[30px] z-0 h-[360px] w-[340px] text-[#2A6B4B]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M60 300C40 220 70 120 190 50c20 100-10 190-130 250z" />
                <path d="M60 300C95 220 130 150 190 50" />
                <path d="M100 235l40-12M120 195l34-14M140 150l26-12" />
                <path d="M170 300c-10-60 20-120 100-160 10 70-20 130-100 160z" />
            </svg>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-10 min-h-10 rounded-none bg-transparent p-0! hover:bg-transparent"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo variant="sidebar" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="mt-2 border-t border-white/12 pt-3">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
