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
import { ResidentRecord } from "@/types/resident";
import { Pencil } from "lucide-react";
import { useState } from "react";
import React from "react";
import EditResidentPicture from "./edit-resident-picture";

interface ResidentProfilePictureDialogProps {
  resident: ResidentRecord;
}

const ResidentProfilePictureDialog: React.FC<
  ResidentProfilePictureDialogProps
> = ({ resident }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar className="h-16 w-16 rounded-lg cursor-pointer">
          <Pencil className="absolute transition-all ease-in-out hover:duration-300 bottom-0.5 right-0.5 w-6 h-6 text-blue-300  bg-white/20 p-1 rounded-full" />
          <AvatarImage src={resident.photograph!} alt={resident.full_name} />
          <AvatarFallback className="rounded-lg">
            {resident.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Resident Profile Picture</DialogTitle>
          <DialogDescription>
            Edit resident profile by uploading a new image.
          </DialogDescription>
        </DialogHeader>
        <EditResidentPicture
          resident={resident}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResidentProfilePictureDialog;
