"use client";

import { updateMedication } from "@/app/api/medication";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EditMedicationProps {
  residentId: string;
  medication: any;
  isOpen: boolean;
  onClose: () => void;
  onMedicationUpdated: () => void;
}

const EditMedication: React.FC<EditMedicationProps> = ({
  residentId,
  medication,
  isOpen,
  onClose,
  onMedicationUpdated,
}) => {
  const { toast } = useToast();
  const [form, setForm] = useState(medication);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await updateMedication(residentId, form);
    toast({
      variant: "default",
      description: "Medication updated successfully!",
    });
    onMedicationUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Edit Medication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Medication Name</Label>
          <Input
            name="medication_name"
            value={form.medication_name}
            onChange={handleChange}
          />

          <Label>Dosage</Label>
          <Input name="dosage" value={form.dosage} onChange={handleChange} />

          <Label>Frequency</Label>
          <Input
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
          />

          <Label>Start Date</Label>
          <Input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
          />

          <Label>End Date (Optional)</Label>
          <Input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
          />

          <Label>Instructions</Label>
          <Textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedication;
