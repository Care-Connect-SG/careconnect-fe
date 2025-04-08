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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { MedicationFormSchema, medicationFormSchema } from "../schema";
import { DayMedicationScheduler, WeekMedicationScheduler } from "./scheduler";

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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const methods = useForm<MedicationFormSchema>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      schedule_type: medication.schedule_type,
      repeat: medication.repeat,
      days_of_week: medication.days_of_week,
      times_of_day: medication.times_of_day,
      start_date: medication.start_date,
      instructions: "",
      ...(medication.end_date !== "" && { end_date: medication.end_date })
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

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

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      methods.setValue("start_date", format(date, "yyy-MM-dd"));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      methods.setValue("end_date", format(date, "yyyy-MM-dd"));
    }
  };

  const validateSchedule = () => {
    if (methods.watch("schedule_type") !== "custom") {
      const timesOfDay = methods.getValues("times_of_day");
      if (!timesOfDay || timesOfDay.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid Schedule",
          description: "Please select at least one time of day.",
        });
        return false;
      }
    }
    if (methods.watch("schedule_type") === "week") {
      const daysOfWeek = methods.getValues("days_of_week");
      if (!daysOfWeek || daysOfWeek.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid Schedule",
          description: "Please select at least one day of the week.",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmitForm = async () => {
    if (!validateSchedule()) return;

    try {
      const updatedFields = methods.getValues();
      const medicationData = {
        ...medication,
        ...updatedFields,
      };
      await updateMedication(residentId, medicationData);
      toast({
        variant: "default",
        description: "Medication updated successfully!",
      });
      onMedicationUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error updating medication:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to edit medication. Please try again.",
      });
    }
  };

  return (
    
      <Dialog open={isOpen} onOpenChange={onClose}>
        <FormProvider {...methods}>
        <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800" aria-describedby="edit-medication">
              Edit Medication
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Medication Name</Label>
              <Input {...register("medication_name")} />
              {errors.medication_name && (
                <p className="text-xs text-red-500">
                  {errors.medication_name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  {...register("dosage")}
                  placeholder="e.g., 10mg"
                />
                {errors.dosage && (
                  <p className="text-xs text-red-500">
                    {errors.dosage.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="frequency">Schedule</Label>
                <Select
                  value={methods.watch("schedule_type")}
                  onValueChange={(value) =>
                    methods.setValue(
                      "schedule_type",
                      value as "custom" | "day" | "week",
                    )
                  }
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select a schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="day">By Day</SelectItem>
                      <SelectItem value="week">By Week</SelectItem>
                      <SelectItem value="custom">As Needed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {methods.watch("schedule_type") == "day" && (
              <DayMedicationScheduler />
            )}
            {methods.watch("schedule_type") == "week" && (
              <WeekMedicationScheduler />
            )}

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
              {errors.start_date && (
                <p className="text-xs text-red-500">
                  {errors.start_date.message}
                </p>
              )}
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
              <Textarea {...register("instructions")} />
            </div>
          </div>


          <DialogFooter>

              <Button onClick={handleSubmit(handleSubmitForm)}>Save</Button>

          </DialogFooter>
        </DialogContent>
        </FormProvider>
      </Dialog>
      
  );
};

export default EditMedication;
