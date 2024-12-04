import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePosts } from '@/lib/PostsProvider';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { useSite } from '@/lib/SiteProvider';
import { useUser } from '@/lib/UserProvider';
import MarkdownEditor from '@/containers/MarkdownEditor';

const MarkdownEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { getPostByID } = usePosts();
    const [post, setPost] = useState<BlogPost | null>(null);
    const { user } = useUser();
    const { updateBreadcrumbs } = useSite();

    useEffect(() => {
        const conditionallyRetrieveResource = async () => {
            setTimeout(async () => {
                try {
                    const post = await getPostByID(id as string);

                    if (post!.authorId !== user!.id) throw new Error();

                    setPost(post);
                    updateBreadcrumbs([
                        { label: 'Library', path: '' },
                        { label: 'Code Editor', path: '' },
                        {
                            label: post!.title,
                            path: '/app/editor/posts/' + post!.id,
                            language: 'Markdown',
                        },
                    ]);
                } catch (error) {
                    console.error(error);
                    toast({
                        title: 'Post Not Found.',
                        description: '404 Error. Invalid blog post ID.',
                        variant: 'destructive',
                    });
                    navigate('/404');
                }
            }, 1000);
        };

        conditionallyRetrieveResource();
    }, []);

    return (
        <div className='space-y-6 flex w-full items-center justify-center h-full'>
            {!post ? <Loader2 className='animate-spin' /> : <MarkdownEditor post={post} />}
        </div>
    );
};

export default MarkdownEditorPage;
