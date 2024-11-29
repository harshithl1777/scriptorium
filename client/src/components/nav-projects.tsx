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
    templates: 'text-blue-800 dark:text-blue-300/70',
    blogs: 'text-violet-800 dark:text-violet-300/70',
    search: 'text-amber-800 dark:text-amber-300/70',
    profile: 'text-teal-800 dark:text-teal-300/70',
    reports: 'text-rose-800 dark:text-rose-300/70',
    'developer mode': 'text-sky-800 dark:text-sky-300/70',
};

const BgColors = {
    templates: 'bg-blue-600 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500',
    blogs: 'bg-violet-600 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-500',
    search: 'bg-amber-600 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-500',
    profile: 'bg-teal-600 hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-500',
    reports: 'bg-rose-600 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-500',
    'developer mode': 'bg-sky-600 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-500',
};

const BgColorsHover = {
    templates: 'hover:bg-blue-500/20',
    blogs: 'hover:bg-violet-500/20',
    search: 'hover:bg-amber-500/10',
    profile: 'hover:bg-teal-500/20',
    reports: 'hover:bg-rose-500/20',
    'developer mode': 'hover:bg-sky-500/10',
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
                    const name = item.name.toLowerCase() as 'templates' | 'blogs' | 'search';
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                asChild
                                className={
                                    pathname.includes(name) || pathname.includes(name.split(' ')[0])
                                        ? BgColors[name]
                                        : BgColorsHover[name]
                                }
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
