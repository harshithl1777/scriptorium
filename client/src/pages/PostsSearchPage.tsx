import { PostsTable } from '@/containers/PostsSearchTable';
import { useSite } from '@/lib/SiteProvider';
import { useEffect } from 'react';

const PostsSearchPage = () => {
    const { updateBreadcrumbs } = useSite();

    useEffect(() => {
        updateBreadcrumbs([{ label: 'Posts', path: '' }]);
    }, []);

    return (
        <div className='ml-8 mr-8 space-y-6'>
            <PostsTable />
        </div>
    );
};

export default PostsSearchPage;
