"use client";

import { deleteMedication } from "@/app/api/medication";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import html2canvas from "html2canvas";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { QrCodeIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import React, { useState, useRef } from "react";

interface MedicationProps {
  medication: {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    instructions?: string;
    prescriber?: string;
  };
  onEdit: (medication: any) => void;
}

const ResidentMedication: React.FC<MedicationProps> = ({
  medication,
  onEdit,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { residentProfile } = useParams() as { residentProfile: string };
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    try {
      const canvas = await html2canvas(qrRef.current);
      const link = document.createElement("a");
      link.download = `${medication.medication_name.replace(
        /\s+/g,
        "_",
      )}_qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been downloaded successfully.",
      });
    } catch (err) {
      console.error("QR download failed:", err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return format(date, "MMMM do, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteMedication(residentProfile, medication.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medications", residentProfile],
      });
      toast({
        variant: "default",
        title: "Medication Deleted",
        description: `${medication.medication_name} has been removed successfully.`,
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Medication",
        description:
          error.message || "Failed to delete medication. Please try again.",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <Card className="w-full border bg-gray-50 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex flex-row items-center gap-4">
            <CardTitle className="tracking-tight text-sm font-bold">
              {medication.medication_name.toUpperCase()}
            </CardTitle>
            <Badge variant="outline" className="text-xs font-medium bg-gray-50">
              {medication.frequency}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit(medication)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer text-red-600 focus:text-red-600"
                disabled={deleteMutation.isPending}
              >
                <Trash className="mr-2 h-4 w-4" />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-500">Dosage</p>
              <p className="text-sm">{medication.dosage || "N/A"}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-500">Start Date</p>
              <p className="text-sm">
                {formatDate(medication.start_date) || "N/A"}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-500">
                Prescribed by
              </p>
              <p className="text-sm">
                {medication.prescriber || "Doctor David Lim"}
              </p>
            </div>
            {medication.end_date && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-500">End Date</p>
                <p className="text-sm">{formatDate(medication.end_date)}</p>
              </div>
            )}
          </div>

          {medication.instructions && (
            <div className="mt-2 border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-gray-500">
                Instructions
              </p>
              <p className="text-sm">{medication.instructions}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Popover open={openQR} onOpenChange={setOpenQR}>
              <PopoverTrigger asChild>
                <div className="flex items-center cursor-pointer text-blue-500 hover:text-blue-600">
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">QR Code</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 flex flex-col items-center space-y-3 bg-white shadow-lg">
                <div ref={qrRef} className="bg-white p-4 rounded border">
                  <QRCodeCanvas value={medication.id} size={150} level="H" />
                </div>
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="h-8 text-xs w-full bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                >
                  Download QR Code
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {medication.medication_name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ResidentMedication;
