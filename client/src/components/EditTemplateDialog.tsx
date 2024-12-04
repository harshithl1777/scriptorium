import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import MultipleSelector from '@/components/ui/multi-selector';
import { useTags } from '@/lib/TagsProvider';
import { CodeTemplate } from '@/utils/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { Separator } from './ui/separator';
import { useUser } from '@/lib/UserProvider';

interface EditCodeTemplateDialogProps {
    codeTemplate: CodeTemplate;
    isOpen: boolean;
    onClose: () => void;
}

export function EditCodeTemplateDialog({ codeTemplate, isOpen, onClose }: EditCodeTemplateDialogProps) {
    const [formData, setFormData] = useState({
        title: codeTemplate.title,
        description: codeTemplate.description,
        code: codeTemplate.code,
        language: codeTemplate.language,
        tags: codeTemplate.tags.map((tag) => tag.name),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, getUserByID } = useUser();
    const { toast } = useToast();
    const { tags: availableTags, fetchTags } = useTags();

    useEffect(() => {
        if (isOpen) {
            if (!availableTags) {
                fetchTags();
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTagsChange = (selectedTags: string[]) => {
        setFormData({
            ...formData,
            tags: selectedTags,
        });
    };

    const handleLanguageChange = (value: string) => {
        setFormData({
            ...formData,
            language: value,
        });
    };

    const validateAndSubmit = async () => {
        setIsSubmitting(true);

        try {
            await axios.put(`/api/templates/${codeTemplate.id}`, {
                title: formData.title,
                description: formData.description,
                code: formData.code,
                language: formData.language,
                tags: formData.tags,
            });
            await getUserByID(user!.id);

            toast({
                title: 'Code template updated successfully!',
            });
            onClose();
        } catch (error) {
            console.error('Update Code Template Error:', error);
            toast({
                title: 'Unable to update code template',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Edit Code Template</DialogTitle>
                    <DialogDescription>Modify any metadata about your code template below.</DialogDescription>
                    <Separator className='!mt-4' />
                    <DialogClose />
                </DialogHeader>
                <form className='grid gap-6'>
                    {/* Title Field */}
                    <div className='grid gap-2'>
                        <Label htmlFor='title'>Title</Label>
                        <Input id='title' name='title' value={formData.title} onChange={handleInputChange} required />
                    </div>
                    {/* Description Field */}
                    <div className='grid gap-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Input
                            id='description'
                            name='description'
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label htmlFor='tags'>Tags</Label>
                        <MultipleSelector
                            value={formData.tags.map((tag) => ({
                                label: tag,
                                value: tag.toLowerCase().replace(/\W/g, '-'),
                            }))}
                            onChange={(selected) => handleTagsChange(selected.map((option) => option.label))}
                            placeholder='Start typing to add tags...'
                            hidePlaceholderWhenSelected
                            creatable
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label>Language</Label>
                        <Select defaultValue={formData.language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select language' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup className='w-full'>
                                    <SelectItem value='C' className='w-full'>
                                        <div className='flex flex-row w-full'>C</div>
                                    </SelectItem>
                                    <SelectItem value='C++'>C++</SelectItem>
                                    <SelectItem value='Java'>Java</SelectItem>
                                    <SelectItem value='Python'>Python</SelectItem>
                                    <SelectItem value='JavaScript'>JavaScript</SelectItem>
                                    <SelectItem value='Ruby'>Ruby</SelectItem>
                                    <SelectItem value='Go'>Go</SelectItem>
                                    <SelectItem value='PHP'>PHP</SelectItem>
                                    <SelectItem value='Swift'>Swift</SelectItem>
                                    <SelectItem value='Rust'>Rust</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </form>
                <DialogFooter className='!mt-4'>
                    <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={validateAndSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className='animate-spin mr-2' />}
                        {isSubmitting ? 'Saving' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
