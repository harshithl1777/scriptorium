'use client';

import * as React from 'react';
import { FlagIcon, LibrarySquare, Search, Code, PenLine } from 'lucide-react';

import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { useUser } from '@/lib/UserProvider';

const data = {
    platform: [
        {
            name: 'Library',
            url: '/app/library',
            icon: LibrarySquare,
        },
        {
            name: 'Code Templates',
            url: '/app/templates/search',
            icon: Code,
        },
        {
            name: 'Blog Posts',
            url: '/app/posts/search',
            icon: PenLine,
        },
    ],
    admin: [
        {
            name: 'Reports',
            url: '/account/reports',
            icon: FlagIcon,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useUser();
    return (
        <Sidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavProjects platform={data.platform} name='Platform' />
                {user!.isAdmin && <NavProjects platform={data.admin} name='Admin' />}
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{
                        email: user!.email,
                        name: user!.firstName + ' ' + user!.lastName,
                        avatar: user!.avatarURL || '',
                    }}
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
