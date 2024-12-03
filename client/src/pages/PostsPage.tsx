import { useNavigate, useParams } from 'react-router-dom';
import Logo from '@/assets/images/Logo.svg';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/lib/PostsProvider';
import { useSession } from '@/lib/SessionProvider';
import { useEffect, useRef, useState } from 'react';
import { BlogPost } from '@/utils/types';
import { CalendarDays, Flag, LibrarySquare, Loader2, Reply, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/UserProvider';
import axios from 'axios';
import { useTheme } from '@/lib/ThemeProvider';
import '@/pages/posts.css';
import PostContent from '@/containers/PostContent';
import dayjs from 'dayjs';

const tagClassnames = [
    'bg-rose-500/10 text-rose-400 border-rose-500/40 text-md font-normal px-4 py-1',
    'bg-orange-500/10 text-orange-400 border-orange-500/40 text-md font-normal px-4 py-1',
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/40 text-md font-normal px-4 py-1',
    'bg-blue-500/10 text-blue-400 border-blue-500/40 text-md font-normal px-4 py-1',
    'bg-violet-500/10 text-violet-400 border-violet-500/40 text-md font-normal px-4 py-1',
];

function capitalizeWords(str: string) {
    if (typeof str !== 'string') return '';
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const PostsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { getPostByID } = usePosts();
    const { isLoading, session, getSession } = useSession();
    const { user, getUserByID } = useUser();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [reason, setReason] = useState('');
    const [upvoteLoading, setUpvoteLoading] = useState(false);
    const [downvoteLoading, setDownvoteLoading] = useState(false);
    const [reportingLoading, setReportingLoading] = useState(false);
    const [postCommentLoading, setPostCommentLoading] = useState(false);
    const [parentId, setParentId] = useState<number | null>(null);
    const [targetName, setTargetName] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [reportState, setReportState] = useState<{ targetType: null | string; parentId: null | string }>({
        targetType: null,
        parentId: null,
    });
    const targetRef = useRef(null);

    useEffect(() => {
        const conditionallyRetrieveResource = async () => {
            return setTimeout(async () => {
                try {
                    const post = await getPostByID(id as string);
                    await getSession();

                    if (post!.isHidden && (!user || user.id !== post!.authorId)) throw new Error();

                    setPost(post);
                } catch {
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

    const upvoteSubmit = async () => {
        setUpvoteLoading(true);
        try {
            const alreadyUpvoted = user!.upvotes.post.includes(post!.id);
            await axios.post('/api/ratings/posts/' + post!.id, {
                action: alreadyUpvoted ? 'deupvote' : 'upvote',
            });
            const updatedPost = await getPostByID(post!.id.toString());
            setPost(updatedPost);
            await getUserByID(user!.id);
        } catch {
            toast({
                title: 'Upvoting Failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setUpvoteLoading(false);
        }
    };

    const downvoteSubmit = async () => {
        setDownvoteLoading(true);
        const alreadyDownvoted = user!.downvotes.post.includes(post!.id);
        try {
            await axios.post('/api/ratings/posts/' + post!.id, {
                action: alreadyDownvoted ? 'dedownvote' : 'downvote',
            });
            const updatedPost = await getPostByID(post!.id.toString());
            setPost(updatedPost);
            await getUserByID(user!.id);
        } catch {
            toast({
                title: 'Downvoting Failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setDownvoteLoading(false);
        }
    };

    const reportSubmit = async (targetType: string, parentId: string) => {
        setReportingLoading(true);
        try {
            await axios.post('/api/reports', { targetType, targetId: parentId, reason });
            const updatedPost = await getPostByID(post!.id.toString());
            setPost(updatedPost);
            toast({
                title: 'Thank you for reporting!',
                description: 'From all of us here at Blaze, thank you for helping make our community safer!',
            });
        } catch {
            toast({
                title: 'Reporting Failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setReportingLoading(false);
            setReason('');
            setReportState({ targetType: null, parentId: null });
            setDialogOpen(false);
        }
    };

    const scrollToTarget = () => {
        if (targetRef.current) {
            targetRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    const postCommentSubmit = async () => {
        try {
            setPostCommentLoading(true);
            await axios.post('/api/posts/' + post!.id + '/comments', { content, parentId });
            const updatedPost = await getPostByID(post!.id.toString());
            setPost(updatedPost);
            setContent('');
        } catch {
            toast({
                title: 'Comment creation failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setPostCommentLoading(false);
        }
    };

    return (
        <div className='w-full flex flex-col items-center'>
            {!post || isLoading ? (
                <div className='w-full h-[100vh] flex items-center justify-center'>
                    <Loader2 className='animate-spin' />
                </div>
            ) : (
                <div className='w-full flex flex-col items-center p-4 bg-gradient-to-b from-indigo-500/30 to-[#111927]'>
                    <Dialog
                        open={dialogOpen && reportState.parentId !== null && reportState.targetType !== null}
                        onOpenChange={() => {
                            setReportState({
                                targetType: null,
                                parentId: null,
                            });
                            setDialogOpen(false);
                        }}
                    >
                        <DialogContent className='w-[900px] sm:max-w-[425px]'>
                            <DialogHeader>
                                <DialogTitle>
                                    Report{' '}
                                    {dialogOpen &&
                                        reportState.targetType!.at(0)?.toUpperCase() + reportState.targetType!.slice(1)}
                                </DialogTitle>
                                <DialogDescription>
                                    If this {dialogOpen && reportState.targetType} has inappropriate content, please
                                    enter the reason below and report. Note that if this report is found to be spam,
                                    your account may be suspended.
                                </DialogDescription>
                                <Separator className='!mt-4' />
                            </DialogHeader>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className='grid gap-2'>
                                    <Label htmlFor='stdin'>Reason</Label>
                                    <Textarea
                                        id='stdin'
                                        placeholder={'Enter in some comments here'}
                                        minLength={5}
                                        required
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className='focus:!ring-blue-600 resize-none'
                                    />
                                </div>
                            </form>
                            <DialogFooter className='!mt-4'>
                                <Button
                                    type='submit'
                                    onClick={() => reportSubmit(reportState.targetType!, reportState.parentId!)}
                                    className='w-full bg-amber-600 hover:bg-amber-500'
                                    disabled={reportingLoading}
                                >
                                    {reportingLoading && <Loader2 className='animate-spin' />}
                                    {reportingLoading ? 'Submitting' : 'Submit'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <div className='w-full flex flex-row'>
                        <div
                            className='flex flex-row gap-4 w-fit items-center hover:cursor-pointer'
                            onClick={() => navigate('/app/blogs/search')}
                        >
                            <img className='mr-auto block !ml-4' src={Logo} alt='Blaze logo' />
                            <Separator className='bg-slate-500 h-8' orientation='vertical' />
                            <h1 className='text-xl !mt-[3px]'>Blogs</h1>
                        </div>
                        <div className='flex flex-row gap-2 ml-auto'>
                            {!post || !session || isLoading ? (
                                <Loader2 className='animate-spin' />
                            ) : !session!.isLoggedIn ? (
                                <>
                                    <Button
                                        className='border-slate-400 text-slate-200 bg-transparent hover:bg-transparent hover:text-slate-100'
                                        variant='outline'
                                    >
                                        Sign Up
                                    </Button>
                                    <Button
                                        className='border-slate-400 text-slate-200 bg-transparent hover:bg-transparent hover:text-slate-100'
                                        variant='outline'
                                    >
                                        Log In
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='border-slate-400 text-slate-200 bg-transparent hover:bg-transparent hover:text-slate-100'
                                    variant='outline'
                                    onClick={() => navigate('/app/library')}
                                >
                                    <LibrarySquare />
                                    Library
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className='w-full flex flex-col items-center justify-center'>
                        <>
                            <div className='w-full h-[80vh] flex flex-col items-center justify-center'>
                                <h1 className='text-6xl max-w-[800px] text-center font-medium'>{post.title}</h1>
                                <p className='text-2xl max-w-[750px] text-center !mt-3 font-light'>
                                    {post.description}
                                </p>
                                <div className='flex flex-row gap-2 items-center !mt-4'>
                                    {post.tags.map((tag, index) => (
                                        <Badge variant='outline' className={tagClassnames[index]} key={tag.id}>
                                            {capitalizeWords(tag.name)}
                                        </Badge>
                                    ))}
                                </div>
                                <div className='flex flex-row gap-8 items-center !mt-8'>
                                    <div className='flex flex-row gap-4 items-center'>
                                        <CalendarDays size={35} className='text-slate-400' />
                                        <div className='flex flex-col gap-[-1px]'>
                                            <h1>Posted on</h1>
                                            <h3 className='text-slate-400'>
                                                {dayjs(post.createdAt).format('MMMM D, YYYY')}
                                            </h3>
                                        </div>
                                    </div>
                                    <Separator orientation='vertical' className='bg-slate-700' />
                                    <div className='flex flex-row gap-4 items-center'>
                                        <Avatar className='h-10 w-10 rounded-lg'>
                                            <AvatarImage
                                                src={post.author.avatarURL || ''}
                                                alt={'Author profile picture'}
                                            />
                                            <AvatarFallback className='rounded-lg bg-indigo-500 text-slate-100 dark:text-slate-900 text-md font-semibold'>
                                                {post.author.firstName[0] + post.author.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col gap-[-1px]'>
                                            <h1>Written by</h1>
                                            <h3 className='text-slate-400'>
                                                {post.author.firstName + ' ' + post.author.lastName}
                                            </h3>
                                        </div>
                                    </div>
                                    <Separator orientation='vertical' className='bg-slate-700' />
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Button
                                            variant='secondary'
                                            className={
                                                user!.upvotes.post.includes(post.id)
                                                    ? 'bg-teal-500 dark:text-slate-900 hover:bg-teal-400 rounded-xl'
                                                    : 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 rounded-xl'
                                            }
                                            onClick={() => {
                                                if (!session!.isLoggedIn) window.open('/auth/signup');
                                                else upvoteSubmit();
                                            }}
                                        >
                                            {upvoteLoading ? (
                                                <Loader2 className='animate-spin' />
                                            ) : (
                                                <>
                                                    {' '}
                                                    <ThumbsUp size={30} strokeWidth={2.25} />
                                                    {post.upvotes}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant='secondary'
                                            className={
                                                user!.downvotes.post.includes(post.id)
                                                    ? 'bg-rose-600 dark:text-slate-900 hover:bg-rose-500 rounded-xl'
                                                    : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl'
                                            }
                                            onClick={() => {
                                                if (!session!.isLoggedIn) window.open('/auth/signup');
                                                else downvoteSubmit();
                                            }}
                                        >
                                            {downvoteLoading ? (
                                                <Loader2 className='animate-spin' />
                                            ) : (
                                                <>
                                                    <ThumbsDown size={30} strokeWidth={2.25} />
                                                    {post.downvotes}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Separator orientation='vertical' className='bg-slate-700' />
                                    <Button
                                        variant='secondary'
                                        className={
                                            post!.reports.map((report) => report.reporterId).includes(user!.id)
                                                ? 'bg-amber-500 dark:text-slate-900 hover:bg-amber-400 rounded-md'
                                                : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-md'
                                        }
                                        onClick={() => {
                                            if (session!.isLoggedIn) {
                                                setDialogOpen(true);
                                                setReportState({ targetType: 'post', parentId: post!.id.toString() });
                                            } else {
                                                navigate('/auth/signup');
                                            }
                                        }}
                                        disabled={post!.reports.map((report) => report.reporterId).includes(user!.id)}
                                    >
                                        <Flag size={30} strokeWidth={2.25} />
                                        {post!.reports.map((report) => report.reporterId).includes(user!.id)
                                            ? 'Reported'
                                            : 'Report'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    </div>
                </div>
            )}
            {post && !isLoading && (
                <div className='w-full !mt-20 pl-8 pr-8 pb-8 dark:text-purple-50'>
                    <PostContent post={post} />
                    <Separator />
                    <section className='bg-white dark:bg-gray-900 py-8 lg:py-16 w-full antialiased flex flex-col items-start'>
                        <div className='px-4 mr-auto w-full'>
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className='text-lg lg:text-2xl font-bold text-gray-900 dark:text-white flex flex-row items-center gap-2'>
                                    Discussion <Badge>{post.comments.length}</Badge>
                                </h2>
                            </div>
                            <form onSubmit={(e) => e.preventDefault()} className='mb-6 flex flex-col gap-4'>
                                <Textarea
                                    id='comment'
                                    className=''
                                    placeholder='Write your thoughts here!'
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <Button
                                    onClick={() => {
                                        if (session!.isLoggedIn) {
                                            postCommentSubmit();
                                        } else {
                                            navigate('/auth/signup');
                                        }
                                    }}
                                    className='w-fit'
                                    ref={targetRef}
                                    disabled={postCommentLoading}
                                >
                                    {parentId && !postCommentLoading && <Reply />}
                                    {postCommentLoading && <Loader2 className='animate-spin' />}
                                    {!postCommentLoading && (!parentId ? 'Post comment' : `Reply to ${targetName}`)}
                                    {postCommentLoading && (!parentId ? 'Posting' : `Replying to ${targetName}`)}
                                </Button>
                            </form>
                            {post.comments.map(
                                (comment) =>
                                    comment.parentId === null && (
                                        <>
                                            <article
                                                key={comment.id}
                                                className='p-6 text-base bg-white rounded-lg dark:bg-gray-900'
                                            >
                                                <footer className='flex justify-between items-center mb-2'>
                                                    <div className='flex items-center'>
                                                        <Avatar className='h-10 w-10 rounded-lg'>
                                                            <AvatarImage
                                                                src={comment.author.avatarURL || ''}
                                                                alt={'Comment author profile picture'}
                                                            />
                                                            <AvatarFallback className='rounded-lg bg-indigo-500 text-slate-100 dark:text-slate-900 text-md font-semibold'>
                                                                {comment.author.firstName[0] +
                                                                    comment.author.lastName[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className='!ml-3 flex flex-col gap-0'>
                                                            <p className='inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold'>
                                                                {comment.author.firstName +
                                                                    ' ' +
                                                                    comment.author.lastName}
                                                            </p>
                                                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                                {dayjs(comment.createdAt).format('MMMM D, YYYY')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size='icon'
                                                        variant='outline'
                                                        className='ml-auto flex hover:bg-rose-600'
                                                        onClick={() => {
                                                            if (session!.isLoggedIn) {
                                                                setReportState({
                                                                    targetType: 'comment',
                                                                    parentId: comment.id.toString(),
                                                                });
                                                                setDialogOpen(true);
                                                            } else {
                                                                navigate('/auth/signup');
                                                            }
                                                        }}
                                                        disabled={comment.reports
                                                            .map((report) => report.reporterId)
                                                            .includes(user!.id)}
                                                    >
                                                        <Flag />
                                                    </Button>
                                                </footer>
                                                <p className='text-slate-700 dark:text-slate-200'>{comment.content}</p>
                                                <div className='flex items-center mt-4 space-x-4'>
                                                    <Button
                                                        type='button'
                                                        variant='secondary'
                                                        className='flex items-center text-sm text-white hover:underline dark:text-white font-medium'
                                                        onClick={() => {
                                                            setParentId(comment.id);
                                                            setTargetName(comment.author.firstName);
                                                            scrollToTarget();
                                                        }}
                                                        disabled={postCommentLoading}
                                                    >
                                                        <Reply />
                                                        Reply
                                                    </Button>
                                                </div>
                                            </article>
                                            {post.comments.map(
                                                (second) =>
                                                    second.parentId === comment.id && (
                                                        <article
                                                            key={second.id}
                                                            className='p-6 mb-3 ml-6 lg:ml-12 text-base bg-white rounded-lg dark:bg-gray-900'
                                                        >
                                                            <footer className='flex justify-between items-center mb-2'>
                                                                <div className='flex items-center'>
                                                                    <Avatar className='h-10 w-10 rounded-lg'>
                                                                        <AvatarImage
                                                                            src={second.author.avatarURL || ''}
                                                                            alt={'Comment author profile picture'}
                                                                        />
                                                                        <AvatarFallback className='rounded-lg bg-indigo-500 text-slate-100 dark:text-slate-900 text-md font-semibold'>
                                                                            {second.author.firstName[0] +
                                                                                second.author.lastName[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className='!ml-3 flex flex-col gap-0'>
                                                                        <p className='inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold'>
                                                                            {second.author.firstName +
                                                                                ' ' +
                                                                                second.author.lastName}
                                                                        </p>
                                                                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                                            {dayjs(second.createdAt).format(
                                                                                'MMMM D, YYYY',
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size='icon'
                                                                    variant='outline'
                                                                    className='ml-auto flex hover:bg-rose-600'
                                                                    onClick={() => {
                                                                        if (session!.isLoggedIn) {
                                                                            setReportState({
                                                                                targetType: 'comment',
                                                                                parentId: second.id.toString(),
                                                                            });
                                                                            setDialogOpen(true);
                                                                        } else {
                                                                            navigate('/auth/signup');
                                                                        }
                                                                    }}
                                                                    disabled={second.reports
                                                                        .map((report) => report.reporterId)
                                                                        .includes(user!.id)}
                                                                >
                                                                    <Flag />
                                                                </Button>
                                                            </footer>
                                                            <p className='text-gray-500 dark:text-slate-200'>
                                                                {second.content}
                                                            </p>
                                                        </article>
                                                    ),
                                            )}
                                            <Separator />
                                        </>
                                    ),
                            )}
                        </div>
                    </section>
                    <div className='w-full flex items-center justify-center text-slate-400 mb-6'>
                        <h1>© 2024 Copyright Blaze. Built by developers for developers.</h1>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostsPage;
