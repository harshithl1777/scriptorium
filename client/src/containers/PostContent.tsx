import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/lib/ThemeProvider';
import { BlogPost } from '@/utils/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const PostContent = ({ post }: { post: BlogPost }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className='markdown w-full !mt-8 pl-8 pr-8 pb-8 dark:text-purple-50'>
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
                {post.content}
            </Markdown>
        </div>
    );
};

export default PostContent;
