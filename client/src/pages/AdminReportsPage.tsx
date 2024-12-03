import { ReportsTable } from '@/containers/ReportsTable';
import { useSite } from '@/lib/SiteProvider';
import { useUser } from '@/lib/UserProvider';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminReportsPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { updateBreadcrumbs } = useSite();

    useEffect(() => {
        if (!user!.isAdmin) {
            navigate('/404');
        }
        updateBreadcrumbs([{ label: 'Reports', path: '' }]);
    }, []);

    return (
        <div className='ml-8 mr-8 space-y-6'>
            <ReportsTable />
        </div>
    );
};

export default AdminReportsPage;
