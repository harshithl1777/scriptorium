// EditProfileDialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/UserProvider";
import axios from "axios";

interface EditProfileDialogProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string; // Ensure email is included if required
  };
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileDialog({
  user,
  isOpen,
  onClose,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    email: user.email,
  });
  const { setUser, isLoading } = useUser();
  const { toast } = useToast();

  // Reset form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
      });
    }
  }, [isOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(`/api/users/${user.id}`, formData);

      if (response.status === 200) {
        setUser(response.data.payload);
        toast({
          title: "Profile updated successfully!",
          variant: "default",
        });
        onClose();
      } else {
        toast({
          title: "Error updating profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Update Profile Error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <form className="grid gap-4">
          <label htmlFor="firstName">First Name</label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="lastName">Last Name</label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="phoneNumber">Phone Number</label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
