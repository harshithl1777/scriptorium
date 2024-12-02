'use client';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const unselectedTextColors = {
    library: 'text-cyan-800 dark:text-cyan-300/70',
    editor: 'text-teal-800 dark:text-teal-300/70',
    templates: 'text-blue-800 dark:text-blue-300/70',
    posts: 'text-emerald-800 dark:text-emerald-300/70',
    reports: 'text-red-800 dark:text-red-300/70',
};

const BgColors = {
    library: 'bg-cyan-600 hover:bg-cyan-600 dark:bg-cyan-500 dark:hover:bg-cyan-500',
    templates: 'bg-blue-600 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500',
    posts: 'bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-500',
    reports: 'bg-red-600 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-500',
};

const BgColorsHover = {
    library: 'hover:bg-cyan-500/20',
    templates: 'hover:bg-blue-500/20',
    posts: 'hover:bg-emerald-500/10',
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
                    const name = (
                        item.name.toLowerCase().split(' ').length === 1
                            ? item.name.toLowerCase().split(' ')[0]
                            : item.name.toLowerCase().split(' ')[1]
                    ) as 'library' | 'templates' | 'posts' | 'reports';
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                asChild
                                className={
                                    pathname.includes(name) || (name === 'library' && pathname.includes('editor'))
                                        ? BgColors[name]
                                        : BgColorsHover[name]
                                }
                            >
                                <Link to={item.url}>
                                    <item.icon
                                        size={30}
                                        className={
                                            pathname.includes(name) ||
                                            (name === 'library' && pathname.includes('editor'))
                                                ? 'text-slate-100 dark:text-slate-900'
                                                : unselectedTextColors[name]
                                        }
                                    />
                                    <span
                                        className={
                                            pathname.includes(name) ||
                                            (name === 'library' && pathname.includes('editor'))
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
