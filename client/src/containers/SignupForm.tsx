import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateUserState } from '@/utils/types';
import { useState } from 'react';
import { generateEmptyStringObject } from '@/utils/common';
import { useUser } from '@/lib/UserProvider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/lib/SessionProvider';

const initialState = generateEmptyStringObject(['firstName', 'lastName', 'email', 'password']);

export function SignupForm() {
    const { toast } = useToast();
    const { isLoading: userLoading, createUser } = useUser();
    const { isLoading: sessionLoading, createSession } = useSession();
    const [signupState, setSignupState] = useState<CreateUserState>(initialState as CreateUserState);
    const isLoading = userLoading || sessionLoading;

    const handleSignupFormSubmit = async () => {
        try {
            await createUser(signupState);
            await createSession({ email: signupState.email, password: signupState.password });
            await toast({
                title: 'Welcome to Blaze!',
                description: 'Your account has been created. Happy coding!',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Signup Failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Card className='mx-auto w-[500px] !mt-10'>
            <CardHeader>
                <CardTitle className='text-2xl'>Sign Up</CardTitle>
                <CardDescription>Welcome to Blaze! Enter your details below to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className='grid gap-4' onSubmit={(e) => e.preventDefault()}>
                    <div className='flex flex-row gap-2'>
                        <div className='w-full grid gap-2'>
                            <Label htmlFor='firstName'>First Name</Label>
                            <Input
                                id='firstName'
                                placeholder='Clark'
                                disabled={isLoading}
                                value={signupState.firstName}
                                onChange={(e) => setSignupState({ ...signupState, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className='w-full grid gap-2'>
                            <Label htmlFor='lastName'>Last Name</Label>
                            <Input
                                id='lastName'
                                placeholder='Kent'
                                disabled={isLoading}
                                value={signupState.lastName}
                                onChange={(e) => setSignupState({ ...signupState, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className='grid gap-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            type='email'
                            disabled={isLoading}
                            placeholder='clark.kent@dc.com'
                            value={signupState.email}
                            onChange={(e) => setSignupState({ ...signupState, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                            id='password'
                            type='password'
                            placeholder='somethingsecret123@'
                            value={signupState.password}
                            disabled={isLoading}
                            onChange={(e) => setSignupState({ ...signupState, password: e.target.value })}
                            required
                        />
                    </div>
                    <Button onClick={handleSignupFormSubmit} className='w-full' disabled={isLoading}>
                        {isLoading && <Loader2 className='animate-spin' />}
                        {isLoading ? 'Signing you up...' : 'Get started with Blaze'}
                    </Button>
                </form>
                <div className='mt-4 text-center text-sm'>
                    Already have an account?{' '}
                    <Link to='/auth/login' className='underline'>
                        Log In
                    </Link>
                    .
                </div>
            </CardContent>
        </Card>
    );
}
