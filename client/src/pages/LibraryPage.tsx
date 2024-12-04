import { LibraryTable } from '@/containers/LibraryTable';
import { useSite } from '@/lib/SiteProvider';
import { useEffect } from 'react';

const LibraryPage = () => {
    const { updateBreadcrumbs } = useSite();

    useEffect(() => {
        updateBreadcrumbs([{ label: 'Library', path: '' }]);
    }, []);
    return (
        <div className='ml-8 mr-8 space-y-6'>
            <LibraryTable />
        </div>
    );
};

export default LibraryPage;
