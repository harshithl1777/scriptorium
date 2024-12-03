'use client';

import { ChevronsUpDown, HammerIcon, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useSession } from '@/lib/SessionProvider';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar: string;
        admin: boolean;
    };
}) {
    const { isMobile } = useSidebar();
    const { deleteSession } = useSession();
    const navigate = useNavigate();

    const logOutSubmit = async () => {
        await deleteSession();
        navigate('/');
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            {!user.admin ? (
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className='rounded-lg bg-indigo-500 text-slate-100 dark:text-slate-900'>
                                        {user.name.split(' ')[0][0] + user.name.split(' ')[1][0]}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className='p-2 rounded-lg flex items-center justify-center bg-orange-500 text-slate-100 dark:text-slate-900'>
                                            <ShieldCheck size={20} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Admin</TooltipContent>
                                </Tooltip>
                            )}

                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold'>{user.name}</span>
                                <span className='truncate text-xs'>{user.email}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                {!user.admin ? (
                                    <Avatar className='h-8 w-8 rounded-lg'>
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className='rounded-lg bg-indigo-500 text-slate-100 dark:text-slate-900'>
                                            {user.name.split(' ')[0][0] + user.name.split(' ')[1][0]}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className='p-2 rounded-lg flex items-center justify-center bg-orange-500 text-slate-100 dark:text-slate-900'>
                                                <ShieldCheck size={20} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Admin</TooltipContent>
                                    </Tooltip>
                                )}
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <div>
                                        <span className='truncate font-semibold'>{user.name}</span>
                                    </div>
                                    <span className='truncate text-xs'>{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Edit Profile
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <HammerIcon />
                                Developer Mode
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logOutSubmit}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
