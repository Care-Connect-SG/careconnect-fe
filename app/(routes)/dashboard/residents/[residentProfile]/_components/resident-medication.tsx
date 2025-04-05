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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import html2canvas from "html2canvas";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { QrCodeIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import React, { useState } from "react";

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
  const [showQR, setShowQR] = useState(false);
  const qrRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current);
    const link = document.createElement("a");
    link.download = `${medication.medication_name}_qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
          <div className="mt-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQR(!showQR)}
              title="Generate QR"
            >
              <QrCodeIcon className="h-10 w-10 text-gray-500" />
            </Button>
          </div>

          {showQR && (
            <div className="mt-4 space-y-2">
              <div ref={qrRef} className="inline-block bg-white p-4 rounded">
                <QRCodeCanvas value={medication.id} size={150} />
              </div>
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="text-sm"
              >
                Download QR Code
              </Button>
            </div>
          )}
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
