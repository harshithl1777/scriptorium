import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/UserProvider';
import { User } from '@/utils/types';
import { Loader2, SaveIcon } from 'lucide-react';
import { Separator } from './ui/separator';
import { Label } from './ui/label';

interface EditProfileDialogProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileDialog({ user, isOpen, onClose }: EditProfileDialogProps) {
    const [formData, setFormData] = useState({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        avatarURL: user.avatarURL || '',
    });
    const { updateUser, isLoading, getUserByID } = useUser();
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            await updateUser({ ...formData });
            await getUserByID(user!.id);
            toast({
                title: 'Profile updated successfully!',
            });
            onClose();
        } catch (error) {
            console.error('Update Profile Error:', error);
            toast({
                title: 'Unable to update profile',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Enter in any details you'd like to edit your profile</DialogDescription>
                    <Separator className='!mt-4' />
                    <DialogClose />
                </DialogHeader>
                <form className='grid gap-4 !mt-2'>
                    <div className='flex flex-col gap-2'>
                        <Label htmlFor='firstName' className='text-slate-400'>
                            Email
                        </Label>
                        <Input
                            id='firstName'
                            name='firstName'
                            value={formData.email}
                            disabled
                            readOnly
                            aria-readonly
                            required
                        />
                    </div>
                    <div className='grid grid-cols-12 gap-4'>
                        <div className='flex flex-col gap-2 col-span-6'>
                            <Label htmlFor='firstName'>First Name</Label>
                            <Input
                                id='firstName'
                                name='firstName'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col gap-2 col-span-6'>
                            <Label htmlFor='lastName'>Last Name</Label>
                            <Input
                                id='lastName'
                                name='lastName'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-6 !mt-2'>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='phoneNumber'>Phone Number</Label>
                            <Input
                                id='phoneNumber'
                                placeholder='(123)-456-7890'
                                name='phoneNumber'
                                value={formData.phoneNumber as string}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='avatarURL'>Avatar URL</Label>
                            <Input
                                placeholder='https://dc.com/superman.jpg'
                                id='avatarURL'
                                name='avatarURL'
                                type='url'
                                value={formData.avatarURL as string}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </form>
                <DialogFooter className='!mt-4'>
                    <Button variant='outline' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {isLoading ? <Loader2 className='animate-spin' /> : <SaveIcon />}
                        {isLoading ? 'Saving' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
