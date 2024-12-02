'use client';

import * as React from 'react';
import { CircleUser, CodeSquareIcon, FlagIcon, HammerIcon, LibrarySquare, PenSquareIcon, Search } from 'lucide-react';

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
            items: [
                {
                    name: 'Code Editor',
                    icon: CodeSquareIcon,
                },
                {
                    name: 'Blog Editor',
                    icon: PenSquareIcon,
                },
            ],
        },
        {
            name: 'Search',
            url: '/app/search',
            icon: Search,
            items: [],
        },
    ],
    account: [
        {
            name: 'Profile',
            url: '/account/profile',
            icon: CircleUser,
            items: [],
        },
        {
            name: 'Developer Mode',
            url: '/account/developer',
            icon: HammerIcon,
            items: [],
        },
        {
            name: 'Reports',
            url: '/account/reports',
            icon: FlagIcon,
            items: [],
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
                <NavProjects platform={data.account} name='Account' />
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
