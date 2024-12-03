'use client';

import * as React from 'react';
import { FlagIcon, LibrarySquare, Code, PenLine, Loader2 } from 'lucide-react';

import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { useUser } from '@/lib/UserProvider';
import { useSession } from '@/lib/SessionProvider';
import { useEffect } from 'react';
import { NotLoggedInForm } from './notloggedin-form';

const loggedInData = {
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
            url: '/admin/reports',
            icon: FlagIcon,
        },
    ],
};

const NotLoggedInData = {
    platform: [
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useUser();
    const { session, getSession } = useSession();

    useEffect(() => {
        const conditionallyRetrieveSession = async () => {
            if (!session) await getSession();
        };
        conditionallyRetrieveSession();
    });

    return (
        <Sidebar collapsible='icon' {...props}>
            {session === null ? (
                <div className='w-full h-full flex items-center justify-center'>
                    <Loader2 className='animate-spin' />
                </div>
            ) : (
                <>
                    <SidebarHeader>
                        <TeamSwitcher />
                    </SidebarHeader>
                    <SidebarContent>
                        {!session!.isLoggedIn ? (
                            <NavProjects platform={NotLoggedInData.platform} name='Platform' />
                        ) : (
                            <>
                                <NavProjects platform={loggedInData.platform} name='Platform' />
                                {user && user.isAdmin && <NavProjects platform={loggedInData.admin} name='Admin' />}
                            </>
                        )}
                    </SidebarContent>
                    <SidebarFooter>
                        {session!.isLoggedIn ? (
                            <NavUser
                                user={{
                                    id: user!.id.toString(),
                                    email: user!.email,
                                    name: user!.firstName + ' ' + user!.lastName,
                                    avatar: user!.avatarURL || '',
                                    admin: user!.isAdmin,
                                    phoneNumber: user?.phoneNumber || '',
                                }}
                            />
                        ) : (
                            <NotLoggedInForm />
                        )}
                    </SidebarFooter>
                </>
            )}
            <SidebarRail />
        </Sidebar>
    );
}
