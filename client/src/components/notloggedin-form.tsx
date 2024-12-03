import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotLoggedInForm() {
    return (
        <Card className='shadow-none m-4'>
            <form>
                <CardHeader className='p-4 pb-0'>
                    <CardTitle className='text-sm'>Create an Account</CardTitle>
                    <CardDescription>Sign up or log in to save code templates, blog, and do more!</CardDescription>
                </CardHeader>
                <CardContent className='grid gap-2.5 p-4'>
                    <Link to='/auth/signup'>
                        <Button className='w-full shadow-none' size='sm'>
                            Get started
                            <ArrowRight />
                        </Button>
                    </Link>
                </CardContent>
            </form>
        </Card>
    );
}
