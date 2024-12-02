import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { useSite } from '@/lib/SiteProvider';
import {
    COriginal,
    CplusplusOriginal,
    GoOriginalWordmark,
    JavaOriginal,
    JavascriptOriginal,
    PhpPlain,
    PythonOriginal,
    RubyOriginal,
    SwiftOriginal,
} from 'devicons-react';
import MarkdownLight from '@/assets/images/MarkdownLight.svg';
import MarkdownDark from '@/assets/images/MarkdownDark.svg';
import Rust from '@/assets/images/Rust.svg';
import { useTheme } from '@/lib/ThemeProvider';

export default function Layout({ children }: { children: ReactNode }) {
    const { breadcrumbs } = useSite();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const languageIconsMap = {
        Python: <PythonOriginal size={24} />,
        JavaScript: <JavascriptOriginal size={20} />,
        Java: <JavaOriginal size={22} className='brightness-150' />,
        Swift: <SwiftOriginal size={20} />,
        C: <COriginal size={24} />,
        'C++': <CplusplusOriginal size={24} />,
        Rust: <img src={Rust} className='w-5 h-5' />,
        Ruby: <RubyOriginal size={20} />,
        Go: <GoOriginalWordmark size={30} />,
        PHP: <PhpPlain size={30} />,
        Markdown: theme === 'light' ? <img src={MarkdownLight} /> : <img src={MarkdownDark} />,
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className='bg-white dark:bg-[#111927] flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-slate-200 dark:border-slate-800 border-b-[1px]'>
                    <div className='flex items-center gap-2 px-4'>
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={breadcrumb.label} className='flex flex-row items-center gap-2'>
                                        <BreadcrumbItem className='hidden md:block'>
                                            {breadcrumb.path ? (
                                                <Link
                                                    to={breadcrumb.path}
                                                    className='text-slate-900 dark:text-slate-200 flex flex-row items-center gap-2'
                                                >
                                                    {languageIconsMap[breadcrumb.language!]}
                                                    {breadcrumb.label}
                                                </Link>
                                            ) : (
                                                breadcrumb.label
                                            )}
                                        </BreadcrumbItem>
                                        {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </div>
                                ))}
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
                <div className='flex flex-1 flex-col gap-4 pt-0 bg-white dark:bg-[#111927]'>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
