import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/lib/ThemeProvider';
import { BlogPost } from '@/utils/types';
import { EditorView } from '@codemirror/view';
import { LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { tokyoNightDay } from '@uiw/codemirror-theme-tokyo-night-day';
import CodeMirror from '@uiw/react-codemirror';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '@/containers/markdown.css';
import { Button } from '@/components/ui/button';
import { EyeIcon, Loader2, SaveIcon, Share2Icon } from 'lucide-react';
import { usePosts } from '@/lib/PostsProvider';
import { useToast } from '@/hooks/use-toast';

const customDarkBackgroundOverride = EditorView.theme(
    {
        '&': {
            backgroundColor: '#111A27 !important',
        },
        '.cm-gutters': {
            backgroundColor: '#111A27 !important',
            padding: '0px !important',
        },
        '.cm-line': {
            'padding-top': '2px',
            'padding-bottom': '2px',
        },
        '.cm-gutterElement': {
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
        },
    },
    { dark: true },
);

const customLightBackgroundOverride = EditorView.theme(
    {
        '&': {
            backgroundColor: '#FBFDFF !important',
        },
        '.cm-gutters': {
            backgroundColor: '#FBFDFF !important',
            padding: '0px !important',
        },
        '&.cm-focused': {
            outline: 'none !important',
        },
        '.cm-line': {
            'padding-top': '2px',
            'padding-bottom': '2px',
        },
        '.cm-gutterElement': {
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
        },
    },
    { dark: true },
);

const MarkdownEditor = ({ post }: { post: BlogPost }) => {
    const { theme } = useTheme();
    const [content, setContent] = useState(post.content);
    const { isLoading, updatePost } = usePosts();
    const { toast } = useToast();
    const isDark = theme === 'dark';

    const savePostSubmit = async () => {
        try {
            const updatedPost = await updatePost({ ...post, content });
            setContent(updatedPost.content);
            toast({ title: 'Post saved!' });
        } catch {
            toast({
                title: 'Unable to save post',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className='w-full h-full flex flex-row'>
            <div className='w-[50%] h-full mr-auto block border-r-slate-200 dark:border-r-slate-800 border-r-[1px] !pt-2'>
                <CodeMirror
                    value={post.content}
                    style={{ padding: '0px !important', outline: 'none' }}
                    className='!p-0 !h-full'
                    height='100%'
                    maxHeight='calc(100vh - 72px)'
                    theme={
                        isDark
                            ? [tokyoNight, customDarkBackgroundOverride]
                            : [tokyoNightDay, customLightBackgroundOverride]
                    }
                    extensions={[loadLanguage('markdown' as LanguageName)!, EditorView.lineWrapping]}
                    onChange={(value) => setContent(value)}
                />
            </div>
            <div className='flex flex-col w-[50%] maxHeight'>
                <div className='w-full flex flex-row gap-2 items-center p-4 dark:bg-[#0D1520] border-b-[1px] border-r-slate-200 dark:border-b-slate-800'>
                    <Button
                        variant='secondary'
                        className='bg-orange-500 dark:bg-orange-700/20 text-white dark:text-orange-400 font-medium rounded-lg hover:bg-orange-400 dark:hover:bg-orange-700/30'
                        disabled={isLoading}
                        onClick={savePostSubmit}
                    >
                        {isLoading && <Loader2 className='animate-spin' />}
                        {!isLoading && <SaveIcon />}
                        {isLoading ? 'Saving' : 'Save'}
                    </Button>
                    <Button
                        variant='secondary'
                        className='bg-cyan-600 dark:bg-cyan-700/20 text-white dark:text-cyan-400 font-medium rounded-lg hover:bg-cyan-500 dark:hover:bg-cyan-700/30'
                        onClick={() => window.open('/posts/' + post.id)}
                    >
                        <EyeIcon />
                        View
                    </Button>
                    <Button
                        variant='secondary'
                        className='bg-pink-500 dark:bg-pink-700/20 text-white dark:text-pink-400 font-medium rounded-lg hover:bg-pink-400 dark:hover:bg-pink-700/30'
                        onClick={() => {
                            navigator.clipboard.writeText(import.meta.env.VITE_CLIENT_BASE_URL + '/posts/' + post.id);
                            toast({ title: 'Link Copied!' });
                        }}
                    >
                        <Share2Icon />
                        Share
                    </Button>
                </div>
                <div className='markdown w-full h-full overflow-x-clip overflow-y-scroll dark:bg-[#0D1520] pl-8 pr-8 pb-8 dark:text-purple-50'>
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code(props) {
                                const { children, className, ...rest } = props;
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <SyntaxHighlighter
                                        PreTag='div'
                                        children={String(children).replace(/\n$/, '')}
                                        language={match[1]}
                                        style={isDark ? oneDark : oneLight}
                                    />
                                ) : (
                                    <code {...rest} className={className}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {content}
                    </Markdown>
                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
