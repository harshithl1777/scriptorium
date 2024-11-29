import { SignupForm } from '@/containers/SignupForm';
import Logo from '@/assets/images/Logo.svg';

function SignupPage() {
    return (
        <div className='flex flex-col h-screen w-full items-center justify-center px-4'>
            <img src={Logo} alt='Blaze logo' />
            <SignupForm />
        </div>
    );
}

export default SignupPage;
