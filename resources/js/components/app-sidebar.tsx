import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    FileWarning,
    LayoutGrid,
    Map,
    MapPin,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Ringkasan',
        href: '/admin',
        icon: LayoutGrid,
    },
    {
        title: 'Laporan Masuk',
        href: '/admin/reports',
        icon: FileWarning,
    },
    {
        title: 'Insiden',
        href: '/admin/incidents',
        icon: MapPin,
    },
    {
        title: 'Verifikasi Selesai',
        href: '/admin/resolutions',
        icon: CheckCircle2,
    },
    {
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Peta Publik',
        href: '/',
        icon: Map,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
