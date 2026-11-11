import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[#C8EA6B] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-[#0E3B2A] focus:shadow-lg focus:ring-2 focus:ring-[#0E3B2A] focus:outline-none"
            >
                Saltar al contenido principal
            </a>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent id="main-content" variant="header">
                {children}
            </AppContent>
        </AppShell>
    );
}
