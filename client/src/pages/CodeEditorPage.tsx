import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTemplates } from '@/lib/TemplatesProvider';
import { useEffect, useState } from 'react';
import { CodeTemplate, Language } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { useSite } from '@/lib/SiteProvider';
import { useUser } from '@/lib/UserProvider';
import CodeEditor from '@/containers/CodeEditor';

const CodeEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { getTemplateByID } = useTemplates();
    const [template, setTemplate] = useState<CodeTemplate | null>(null);
    const { user } = useUser();
    const { updateBreadcrumbs } = useSite();

    useEffect(() => {
        const conditionallyRetrieveResource = async () => {
            setTimeout(async () => {
                try {
                    const template = await getTemplateByID(id as string);

                    if (template!.authorId !== user!.id) throw new Error();

                    setTemplate(template);
                    updateBreadcrumbs([
                        { label: 'Library', path: '' },
                        { label: 'Code Editor', path: '' },
                        {
                            label: template!.title,
                            path: '/app/editor/templates/' + template!.id,
                            language: template!.language as Language,
                        },
                    ]);
                } catch (error) {
                    console.error(error);
                    toast({
                        title: 'Code Template Not Found.',
                        description: '404 Error. Invalid code template ID.',
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
            {!template ? <Loader2 className='animate-spin' /> : <CodeEditor template={template} />}
        </div>
    );
};

export default CodeEditorPage;
