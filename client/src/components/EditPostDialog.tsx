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
import { BlogPost } from '@/utils/types';
import { Separator } from './ui/separator';
import { useUser } from '@/lib/UserProvider';

interface EditBlogPostDialogProps {
    blogPost: BlogPost;
    isOpen: boolean;
    onClose: () => void;
}

export function EditBlogPostDialog({ blogPost, isOpen, onClose }: EditBlogPostDialogProps) {
    const [formData, setFormData] = useState({
        title: blogPost.title,
        description: blogPost.description,
        content: blogPost.content,
        tags: blogPost.tags.map((tag) => tag.name),
        templateLinks: blogPost.templates.map(
            (template) => `${import.meta.env.VITE_CLIENT_BASE_URL}/templates/${template.id}`,
        ),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, getUserByID } = useUser();
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

    const handleTemplateLinkChange = (index: number, value: string) => {
        const updatedLinks = [...formData.templateLinks];
        updatedLinks[index] = value;
        setFormData({ ...formData, templateLinks: updatedLinks });
    };

    const handleTagsChange = (selectedTags: string[]) => {
        setFormData({
            ...formData,
            tags: selectedTags,
        });
    };

    const validateAndSubmit = async () => {
        const validBaseUrl = `${import.meta.env.VITE_CLIENT_BASE_URL}/templates/`;
        const templateIds: number[] = [];

        for (const link of formData.templateLinks) {
            if (link) {
                console.log(link.startsWith(validBaseUrl), link, validBaseUrl);
                if (!link.startsWith(validBaseUrl)) {
                    toast({
                        title: 'Invalid Link',
                        description: `Links must start with ${validBaseUrl}.`,
                        variant: 'destructive',
                    });
                    return;
                }
                const id = parseInt(link.replace(validBaseUrl, ''), 10);
                if (isNaN(id)) {
                    toast({
                        title: 'Invalid Link',
                        description: `The provided link does not contain a valid template ID.`,
                        variant: 'destructive',
                    });
                    return;
                }
                if (templateIds.includes(id)) {
                    toast({
                        title: 'Duplicate link found',
                        description: 'There seems to be a duplicate template link in your metadata.',
                        variant: 'destructive',
                    });
                    return;
                }
                templateIds.push(id);
            }
        }

        setIsSubmitting(true);

        try {
            await axios.put(`/api/posts/${blogPost.id}`, {
                title: formData.title,
                description: formData.description,
                content: formData.content,
                tags: formData.tags,
                templateIds,
                upvotes: blogPost.upvotes,
                downvotes: blogPost.downvotes,
            });
            await getUserByID(user!.id);

            toast({
                title: 'Blog post updated successfully!',
            });
            onClose();
        } catch (error) {
            console.error('Update Blog Post Error:', error);
            toast({
                title: 'Unable to update blog post',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>Edit Blog Post</DialogTitle>
                    <DialogDescription>Modify any metadata about your blog post below.</DialogDescription>
                    <Separator className='!mt-4' />
                    <DialogClose />
                </DialogHeader>
                <form className='grid gap-6'>
                    <div className='grid gap-2'>
                        <Label htmlFor='title'>Title</Label>
                        <Input id='title' name='title' value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className='grid gap-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
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
                            placeholder='Start typing to add tags..'
                            creatable
                            hidePlaceholderWhenSelected
                            maxSelected={5}
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label>Template Links (max 3)</Label>
                        {formData.templateLinks
                            .concat(['', '', ''])
                            .slice(0, 3)
                            .map((link, index) => (
                                <Input
                                    key={index}
                                    placeholder={`Enter template link ${index + 1}`}
                                    value={link}
                                    onChange={(e) => handleTemplateLinkChange(index, e.target.value)}
                                />
                            ))}
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
