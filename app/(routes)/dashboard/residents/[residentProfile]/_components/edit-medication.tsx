"use client";

import { updateMedication } from "@/app/api/medication";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [form, setForm] = useState({ ...medication });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (medication.start_date) {
      try {
        const date = parseDate(medication.start_date);
        if (date) setStartDate(date);
      } catch (error) {
        console.error("Failed to parse start date:", error);
      }
    }

    if (medication.end_date) {
      try {
        const date = parseDate(medication.end_date);
        if (date) setEndDate(date);
      } catch (error) {
        console.error("Failed to parse end date:", error);
      }
    }
  }, [medication]);

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    let date = new Date(dateString);

    if (isNaN(date.getTime())) {
      if (dateString.includes("/")) {
        const parts = dateString.split("/");
        date = new Date(
          parseInt(parts[2]),
          parseInt(parts[0]) - 1,
          parseInt(parts[1]),
        );
      } else if (dateString.includes("-")) {
        date = parse(dateString, "yyyy-MM-dd", new Date());
      }
    }

    return !isNaN(date.getTime()) ? date : null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setForm({
        ...form,
        start_date: format(date, "yyyy-MM-dd"),
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setForm({
        ...form,
        end_date: format(date, "yyyy-MM-dd"),
      });
    } else {
      setForm({
        ...form,
        end_date: "",
      });
    }
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
          <div>
            <Label>Medication Name</Label>
            <Input
              name="medication_name"
              value={form.medication_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Dosage</Label>
            <Input name="dosage" value={form.dosage} onChange={handleChange} />
          </div>

          <div>
            <Label>Frequency</Label>
            <Input
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  {startDate ? (
                    format(startDate, "MMMM d, yyyy")
                  ) : (
                    <span>Select a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  {endDate ? (
                    format(endDate, "MMMM d, yyyy")
                  ) : (
                    <span>Select a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  disabled={(date) => (startDate ? date < startDate : false)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Instructions</Label>
            <Textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedication;
