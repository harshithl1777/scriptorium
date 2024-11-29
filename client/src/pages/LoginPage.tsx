import { LoginForm } from '@/containers/LoginForm';
import Logo from '@/assets/images/Logo.svg';

function LoginPage() {
    return (
        <div className='flex flex-col h-screen w-full items-center justify-center px-4'>
            <img src={Logo} alt='Blaze logo' />
            <LoginForm />
        </div>
    );
}

export default LoginPage;
