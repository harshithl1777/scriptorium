import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import LogoIcon from '@/assets/images/LogoIcon.svg';

export function TeamSwitcher() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size='lg' className='hover:!bg-transparent hover:cursor-default  !mt-2'>
                            <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
                                <img className='w-9 h-9' src={LogoIcon} alt='Blaze Icon Logo' />
                            </div>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold text-[20px] !mt-[6px]'>Blaze</span>
                                <span className='truncate text-xs font-light mb-1 text-slate-300'>CS Redefined</span>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
