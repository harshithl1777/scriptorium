import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateEmptyStringObject } from '@/utils/common';
import { CreateSessionState } from '@/utils/types';
import { useState } from 'react';
import { useSession } from '@/lib/SessionProvider';
import { useToast } from '@/hooks/use-toast';

const initialState = generateEmptyStringObject(['email', 'password']);

export function LoginForm() {
    const [loginState, setLoginState] = useState<CreateSessionState>(initialState as CreateSessionState);
    const { createSession } = useSession();
    const { toast } = useToast();

    const handleLoginFormSubmit = async () => {
        try {
            await createSession(loginState);
            toast({
                title: 'Welcome back to Blaze!',
                description: "You're now logged in. Happy coding!",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Login Failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Card className='mx-auto max-w-sm !mt-10'>
            <CardHeader>
                <CardTitle className='text-2xl'>Login</CardTitle>
                <CardDescription>Enter your email below to login to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='grid gap-4'>
                        <div className='grid gap-2'>
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='m@example.com'
                                required
                                value={loginState.email}
                                onChange={(e) => setLoginState({ ...loginState, email: e.target.value })}
                            />
                        </div>
                        <div className='grid gap-2'>
                            <div className='flex items-center'>
                                <Label htmlFor='password'>Password</Label>
                            </div>
                            <Input
                                id='password'
                                type='password'
                                placeholder='somethingsecret123@'
                                required
                                value={loginState.password}
                                onChange={(e) => setLoginState({ ...loginState, password: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleLoginFormSubmit} className='w-full'>
                            Login
                        </Button>
                    </div>
                    <div className='mt-4 text-center text-sm'>
                        Don't have an account?{' '}
                        <Link to='/auth/signup' className='underline'>
                            Sign Up
                        </Link>
                        .
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
