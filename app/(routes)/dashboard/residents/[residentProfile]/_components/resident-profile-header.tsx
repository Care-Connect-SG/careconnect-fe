"use client";

import { deleteResident } from "@/app/api/resident";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/utils";
import { ResidentRecord } from "@/types/resident";
import { Trash, QrCodeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import React, { useRef, useState } from "react";
import ResidentProfilePictureDialog from "./resident-profile-picture-dialog";

interface ResidentProfileHeaderProps {
  resident: ResidentRecord;
  onEdit: () => void;
}

const ResidentProfileHeader: React.FC<ResidentProfileHeaderProps> = ({
  resident,
  onEdit,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const age =
    new Date().getFullYear() - new Date(resident.date_of_birth).getFullYear();

  const handleDelete = async () => {
    try {
      await deleteResident(resident.id);
      toast({
        variant: "default",
        title: "Resident deleted",
        description: `${resident.full_name} has been deleted successfully`,
      });
      router.push(`/dashboard/residents`);
    } catch (error: any) {
      console.error("Error deleting resident:", error);
      toast({
        variant: "destructive",
        title: "Error deleting resident",
        description: error.message,
      });
    }
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${resident.full_name.replace(/\s+/g, "_")}_QR.png`;
      link.click();
    } catch (err) {
      console.error("QR download failed:", err);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col sm:flex-row items-center justify-between p-4 bg-white border rounded-md">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ResidentProfilePictureDialog resident={resident} />

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold">
              {toTitleCase(resident.full_name)}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="text-sm text-gray-600">Age: {age}</span>
              <span className="text-sm text-gray-600">
                Room: {resident.room_number}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <Button
            onClick={onEdit}
            variant="outline"
            className="mt-4 sm:mt-0 px-4 py-2 rounded"
          >
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="px-3"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
          {/* QR Icon */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQR(!showQR)}
              title="Generate QR Code"
            >
              <QrCodeIcon className="h-6 w-6 text-gray-500" />
            </Button>

            {/* QR Popout */}
            {showQR && (
              <div className="absolute right-0 mt-2 z-50 bg-white border rounded shadow-lg p-3 flex flex-col items-center space-y-2">
                <div
                  ref={qrRef}
                  className="bg-white p-4 rounded inline-block"
                >
                  <QRCodeCanvas
                    value={resident.id}
                    size={150}
                    level="H"
                  />
                </div>

                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  Download
                </Button>
              </div>
            )}
          </div>


        </div>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this resident?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete {resident.full_name}'s record
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ResidentProfileHeader;
