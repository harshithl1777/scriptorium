import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Rocket, Target, Zap } from 'lucide-react';

const navItems = [
    { label: 'Code Editor', href: '/app/library' },
    { label: 'Blogs', href: '/app/blogs/search' },
    { label: 'Templates', href: '/app/templates/search' },
];
import Logo from '@/assets/images/Logo.svg';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className='min-h-screen bg-[#0d141f]'>
            <div className='mx-auto relative'>
                {/* Navigation */}
                <nav className='flex items-center justify-between p-8'>
                    <div className='flex items-center gap-16'>
                        {/* Logo */}
                        <div className='flex items-center gap-2 mb-2'>
                            <img src={Logo} alt='Logo' />
                        </div>

                        {/* Nav Menu */}
                        <NavigationMenu>
                            <NavigationMenuList className='flex gap-16'>
                                {navItems.map((item) => (
                                    <NavigationMenuItem key={item.label}>
                                        <NavigationMenuLink
                                            className='text-slate-300 hover:text-indigo-50 transition-colors hover:underline underline-offset-4'
                                            href={item.href}
                                        >
                                            {item.label}
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Auth Buttons */}
                    <div className='flex items-center gap-4'>
                        <Link to='/auth/signup'>
                            <Button variant='default' className='bg-[#5b5bd6] hover:bg-[#4f4fc7]'>
                                Sign Up
                            </Button>
                        </Link>
                        <Link to='/auth/login'>
                            <Button
                                variant='outline'
                                className='border-indigo-500/50 text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 hover:text-indigo-300'
                            >
                                Log In
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className='flex flex-col items-center justify-center text-center mt-32'>
                    <Badge
                        variant='outline'
                        className='bg-[rgba(255,142,0,0.07)] text-[#FFA057] border-orange-500/50 flex items-center text-sm font-medium gap-2 py-1 px-4'
                    >
                        <Target size={16} />
                        By developers for developers
                    </Badge>

                    <h1 className='text-6xl font-medium tracking-tight text-[#e0dffe] max-w-[679px] leading-[60px] mt-6 mb-6'>
                        Learning computer science just got <span className='text-[#5b5bd6]'>easier</span>.
                    </h1>

                    <p className='text-2xl text-[#e0dffe] max-w-[761px] font-light'>
                        Let's face it. Learning computer science is hard. Blaze makes it easier by combining code
                        editing, blogs, and discussions in one place.
                    </p>

                    <div className='flex items-center gap-6 !mt-8'>
                        <Button
                            size='lg'
                            className='bg-[#5b5bd6] hover:bg-[#4f4fc7] flex items-center gap-2 text-md p-6 rounded-lg'
                        >
                            <Rocket className='w-5 h-5' />
                            Sign up for Blaze
                        </Button>

                        <Button
                            variant='outline'
                            size='lg'
                            className='border-indigo-500/50 text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 hover:text-indigo-300 flex items-center gap-2 text-md p-6 rounded-lg'
                        >
                            <Zap />
                            Try it out first
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
