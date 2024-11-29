import { AppSidebar } from '@/components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

export default function Layout({ names, links, children }: { names: string[]; links: string[]; children: ReactNode }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className='bg-white dark:bg-[#111927] flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-slate-200 dark:border-slate-800 border-b-[1px]'>
                    <div className='flex items-center gap-2 px-4'>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className='hidden md:block'>
                                    <Link to={links[0]} className='text-slate-400'>
                                        {pathname.split('/')[2].at(0)?.toUpperCase() + pathname.split('/')[2].slice(1)}
                                    </Link>
                                </BreadcrumbItem>
                                {names.length > 1 && (
                                    <>
                                        <BreadcrumbSeparator className='hidden md:block' />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>na</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='ml-auto mr-4 flex flex-row gap-2'>
                        <Button variant='outline' size='icon' onClick={() => navigate('/app/search')}>
                            <Search />
                            <span className='sr-only'>Toggle theme</span>
                        </Button>
                        <ModeToggle />
                    </div>
                </header>
                <div className='flex flex-1 flex-col gap-4 p-4 pt-0 bg-white dark:bg-[#111927]'>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
