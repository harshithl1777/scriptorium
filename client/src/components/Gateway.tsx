import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/lib/SessionProvider';
import useQuery from '@/hooks/useQuery';
import { Loader2 } from 'lucide-react';

interface GatewayProps {
    children: ReactNode;
}

const Gateway: React.FC<GatewayProps> = ({ children }) => {
    const redirectURL = useQuery('redirect') || '/app/templates';
    const { session, isLoading, getSession } = useSession();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        if (session === null) {
            setShowLoader(true);
            getSession().then(async () => {
                setTimeout(() => setShowLoader(false), 1000);
            });
        } else {
            setShowLoader(false);
        }
    }, []);

    if (showLoader || isLoading) {
        return (
            <div className='w-full h-screen flex items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    return session && session.isLoggedIn ? <Navigate to={redirectURL} /> : <>{children}</>;
};

export default Gateway;
