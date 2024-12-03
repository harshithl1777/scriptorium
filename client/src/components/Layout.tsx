import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { ChevronDown, Code, GitFork, Loader2, Pen, PenLine, Search } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/lib/SessionProvider';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function Layout({ children }: { children: ReactNode }) {
    const { breadcrumbs } = useSite();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { session } = useSession();

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
                                                <div className='flex flex-row items-center gap-2'>
                                                    {breadcrumb.fork && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <GitFork
                                                                    size={18}
                                                                    className='text-slate-700 dark:text-slate-400'
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Forked Template</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {breadcrumb.language && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div>{languageIconsMap[breadcrumb.language]}</div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{breadcrumb.language}</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <Link
                                                        to={breadcrumb.path}
                                                        className='text-slate-900 dark:text-slate-200 flex flex-row items-center gap-2'
                                                    >
                                                        {breadcrumb.label}
                                                    </Link>
                                                </div>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size='icon' variant='outline'>
                                    <Search />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={() => navigate('/app/templates/search')}>
                                    <Code /> Search Code Templates
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/app/posts/search')}>
                                    <PenLine /> Search Blog Posts
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <span className='sr-only'>Toggle theme</span>
                        <ModeToggle />
                    </div>
                </header>
                {session === null ? (
                    <div className='flex flex-1 flex-col gap-4 pt-0 bg-white dark:bg-[#111927] items-center justify-center'>
                        <Loader2 className='animate-spin' />
                    </div>
                ) : (
                    <div className='flex flex-1 flex-col gap-4 pt-0 bg-white dark:bg-[#111927]'>{children}</div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
