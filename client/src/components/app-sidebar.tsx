'use client';

import * as React from 'react';
import {
    CircleUser,
    CodeSquareIcon,
    FlagIcon,
    HammerIcon,
    LibrarySquare,
    PenSquareIcon,
    Search,
    SearchCodeIcon,
} from 'lucide-react';

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
            name: 'Editor',
            url: '/app/editor',
            icon: CodeSquareIcon,
        },
        {
            name: 'Search',
            url: '/app/search',
            icon: Search,
        },
    ],
    account: [
        {
            name: 'Profile',
            url: '/account/profile',
            icon: CircleUser,
        },
        {
            name: 'Developer Mode',
            url: '/account/developer',
            icon: HammerIcon,
        },
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
