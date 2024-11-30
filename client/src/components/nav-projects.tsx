'use client';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const unselectedTextColors = {
    library: 'text-cyan-800 dark:text-cyan-300/70',
    editor: 'text-sky-800 dark:text-sky-300/70',
    search: 'text-violet-800 dark:text-violet-300/70',
    profile: 'text-amber-800 dark:text-amber-300/70',
    developer: 'text-orange-800 dark:text-orange-300/70',
    reports: 'text-red-800 dark:text-red-300/70',
};

const BgColors = {
    library: 'bg-cyan-600 hover:bg-cyan-600 dark:bg-cyan-500 dark:hover:bg-cyan-500',
    editor: 'bg-sky-600 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-500',
    search: 'bg-violet-600 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-500',
    profile: 'bg-amber-600 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-500',
    developer: 'bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500',
    reports: 'bg-red-600 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-500',
};

const BgColorsHover = {
    library: 'hover:bg-cyan-500/20',
    editor: 'hover:bg-sky-500/10',
    search: 'hover:bg-violet-500/20',
    profile: 'hover:bg-amber-500/20',
    developer: 'hover:bg-orange-500/10',
    reports: 'hover:bg-red-500/20',
};

export function NavProjects({
    platform,
    name,
}: {
    platform: {
        name: string;
        url: string;
        icon: LucideIcon;
    }[];
    name: string;
}) {
    const { pathname } = useLocation();

    return (
        <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
            <SidebarGroupLabel className='text-slate-700 dark:text-slate-400'>{name}</SidebarGroupLabel>
            <SidebarMenu>
                {platform.map((item) => {
                    const name = item.name.toLowerCase().split(' ')[0] as
                        | 'library'
                        | 'editor'
                        | 'search'
                        | 'profile'
                        | 'reports'
                        | 'developer';
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                asChild
                                className={pathname.includes(name) ? BgColors[name] : BgColorsHover[name]}
                            >
                                <Link to={item.url}>
                                    <item.icon
                                        size={30}
                                        className={
                                            pathname.includes(name) || pathname.includes(name.split(' ')[0])
                                                ? 'text-slate-100 dark:text-slate-900'
                                                : unselectedTextColors[name]
                                        }
                                    />
                                    <span
                                        className={
                                            pathname.includes(name) || pathname.includes(name.split(' ')[0])
                                                ? 'text-slate-100 dark:text-slate-900  font-medium'
                                                : unselectedTextColors[name]
                                        }
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
