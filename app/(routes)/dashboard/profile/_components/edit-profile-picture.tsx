"use client";

import { editProfilePicture, removeProfilePicture } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import React, { useRef, useState, useCallback } from "react";
import AvatarEditor from "react-avatar-editor";
import { FileRejection, useDropzone } from "react-dropzone";

interface EditPictureProps {
  user: User;
  onClose: () => void;
}

const EditPicture: React.FC<EditPictureProps> = ({ user, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editorRef = useRef<AvatarEditor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [slideValue, setSlideValue] = useState<number>(10);
  const [selectedImage, setSelectedImage] = useState<File | string | null>(
    null,
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], _rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        setSelectedImage(acceptedFiles[0]);
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5242880,
    multiple: false,
  });

  const dataURLtoBlob = (dataURL: string): Blob => {
    const byteString = atob(dataURL.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/webp" });
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (editorRef.current) {
      const dataUrl = editorRef.current.getImageScaledToCanvas().toDataURL();
      const blob = dataURLtoBlob(dataUrl);
      setLoading(true);
      setButtonDisabled(true);
      handleUpload(blob);
    } else {
      toast({
        title: "An error occurred, please try again",
        description: "Failed to save the image",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (blob: Blob): Promise<void> => {
    const formData = new FormData();
    formData.append("image", blob, "edited-image.webp");

    try {
      await editProfilePicture(user, formData);
      toast({
        title: "Profile updated successfully",
        description: "Your profile picture has been updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onClose();
    } catch (error: any) {
      console.error("Error uploading the image:", error);
      toast({
        title: "An error occurred, please try again",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      await removeProfilePicture(user);
      toast({
        title: "Profile picture removed successfully",
        description: "Your profile picture has been removed successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onClose();
    } catch (error: any) {
      console.error("Error removing the image:", error);
      toast({
        title: "An error occurred, please try again",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  return (
    <div className={`${selectedImage && "pt-6"}`}>
      <div className="flex flex-col items-center justify-center">
        {selectedImage && (
          <>
            <AvatarEditor
              ref={editorRef}
              image={selectedImage}
              width={320}
              height={320}
              border={0}
              borderRadius={8}
              color={[0, 0, 0, 0.72]}
              scale={slideValue / 10}
              rotate={0}
            />
            <Slider
              defaultValue={[33]}
              min={10}
              max={50}
              value={[slideValue]}
              onValueChange={(value: number[]) => setSlideValue(value[0])}
              className="mt-6"
            />
          </>
        )}
      </div>

      <div className="cursor-pointer text-sm">
        {!selectedImage && user.profile_picture && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleRemovePicture}
          >
            Remove current picture
          </Button>
        )}

        <Input {...getInputProps()} />
        <div
          className={`${
            !selectedImage && user.profile_picture ? "mt-3" : "mt-6"
          } flex items-center justify-center py-2 px-4 border-2 border-dotted rounded-md transition-all duration-300 ease-in-out ${
            isDragActive
              ? "border-gray-400 bg-blue-100"
              : "border-gray-400 bg-transparent cursor-pointer hover:border-gray-500"
          }`}
          {...getRootProps()}
        >
          <Paperclip className="mr-2 h-4 w-4 text-gray-600" />
          <p className="text-sm font-semibold text-gray-600">
            {selectedImage
              ? "Drop your new file here, or re-click to replace it"
              : "Drag and drop file here, or click to select a file"}
          </p>
        </div>
      </div>

      {selectedImage && (
        <Button
          disabled={!selectedImage || buttonDisabled}
          onClick={handleSave}
          className="mt-4 w-full"
        >
          {loading ? <Spinner /> : "Done"}
        </Button>
      )}
    </div>
  );
};

export default EditPicture;
