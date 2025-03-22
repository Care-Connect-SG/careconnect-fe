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
import { Pencil } from "lucide-react";
import { useState } from "react";
import React from "react";
import EditProfilePicture from "./edit-profile-picture";

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
          <Pencil className="absolute transition-all ease-in-out hover:duration-300 bottom-0.5 right-0.5 w-6 h-6 text-blue-300  bg-white/20 p-1 rounded-full" />
          <AvatarImage src={user.profile_picture!} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>
            Edit your profile picture by uploading a new image.
          </DialogDescription>
        </DialogHeader>
        <EditProfilePicture user={user} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureDialog;
