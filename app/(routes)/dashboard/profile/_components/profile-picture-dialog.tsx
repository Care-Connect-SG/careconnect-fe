"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { useState } from "react";
import React from "react";
import EditPicture from "./edit-profile-picture";

interface ProfilePictureDialogProps {
  user: User;
}

const ProfilePictureDialog: React.FC<ProfilePictureDialogProps> = ({
  user,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar className="h-16 w-16 rounded-lg cursor-pointer">
          <AvatarImage src={user.profile_picture} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set New Profile Picture</DialogTitle>
          <DialogDescription>
            Set your profile picture by uploading a new image.
          </DialogDescription>
        </DialogHeader>
        <EditPicture user={user} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureDialog;
