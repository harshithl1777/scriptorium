import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/lib/SessionProvider';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/lib/UserProvider';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { pathname } = useLocation();
    const { session, isLoading, getSession } = useSession();
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        if (session === null) {
            setShowLoader(true);
            getSession().then(() => {
                setTimeout(() => setShowLoader(false), 1000);
            });
        }
    }, []);

    if (isLoading || showLoader) {
        return (
            <div className='w-full h-screen flex items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    if (session && !session.isLoggedIn) {
        return <Navigate to={`/auth/login?redirect=${pathname}`} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
