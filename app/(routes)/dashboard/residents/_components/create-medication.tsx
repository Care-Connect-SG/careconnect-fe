"use client";

import { createMedication } from "@/app/api/medication";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CreateMedicationProps {
  residentId: string;
  isOpen: boolean;
  onClose: () => void;
  onMedicationAdded: () => void;
}

const CreateMedication: React.FC<CreateMedicationProps> = ({
  residentId,
  isOpen,
  onClose,
  onMedicationAdded,
}) => {
  const [form, setForm] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
    instructions: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await createMedication(residentId, form);
    onMedicationAdded();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add New Medication
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable area to prevent cut-off */}
        <ScrollArea className="max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Medication Name
              </Label>
              <Input
                name="medication_name"
                value={form.medication_name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Dosage
              </Label>
              <Input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Frequency
              </Label>
              <Input
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Start Date
              </Label>
              <Input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                End Date (Optional)
              </Label>
              <Input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Instructions
              </Label>
              <Textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-5">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMedication;
