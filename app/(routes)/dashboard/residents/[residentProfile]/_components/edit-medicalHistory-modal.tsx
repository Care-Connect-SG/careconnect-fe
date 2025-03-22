"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: string;
  residentId: string;
  initialData: any; // You can narrow this later to a union type for each template
  onSave: (updatedData: any) => Promise<void>;
}

const EditMedicalRecordModal: React.FC<EditMedicalRecordModalProps> = ({
  isOpen,
  onClose,
  templateType,
  residentId,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const { toast } = useToast();

  // Update local form data if initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      toast({
        title: "Record updated",
        description: "Medical record updated successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update medical record.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Edit Medical Record</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {templateType === "condition" && (
            <>
              <div>
                <Label htmlFor="condition_name">Condition Name</Label>
                <Input
                  id="condition_name"
                  name="condition_name"
                  value={formData.condition_name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_of_diagnosis">Date of Diagnosis</Label>
                <Input
                  type="date"
                  id="date_of_diagnosis"
                  name="date_of_diagnosis"
                  value={formData.date_of_diagnosis || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="treating_physician">Treating Physician</Label>
                <Input
                  id="treating_physician"
                  name="treating_physician"
                  value={formData.treating_physician || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="treatment_details">Treatment Details</Label>
                <Textarea
                  id="treatment_details"
                  name="treatment_details"
                  value={formData.treatment_details || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="current_status">Current Status</Label>
                <Input
                  id="current_status"
                  name="current_status"
                  value={formData.current_status || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          {/* Add additional form sections for other template types as needed */}
          <DialogFooter>
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicalRecordModal;
