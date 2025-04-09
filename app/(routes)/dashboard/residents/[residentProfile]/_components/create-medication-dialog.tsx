"use client";

import { fetchMedicationByBarcode } from "@/app/api/fixed-medication";
import { createMedication } from "@/app/api/medication";
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
import { BrowserQRCodeReader } from "@zxing/browser";
import { format } from "date-fns";
import { CalendarIcon, QrCode, Scan, Undo } from "lucide-react";
import React, { useState, useRef, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Webcam from "react-webcam";
import { MedicationFormSchema, medicationFormSchema } from "../schema";
import { DayMedicationScheduler, WeekMedicationScheduler } from "./scheduler";

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
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const methods = useForm<MedicationFormSchema>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      medication_name: "",
      dosage: "",
      schedule_type: "day",
      start_date: "",
      instructions: "",
      times_of_day: [],
      days_of_week: [],
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const handleScan = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast({
        variant: "destructive",
        title: "Camera error",
        description: "Unable to capture image from camera",
      });
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      try {
        const result = await new BrowserQRCodeReader().decodeFromImageElement(
          img
        );
        const scannedId = result.getText();

        toast({
          description: "Scanning for medication...",
        });

        const medicationData = await fetchMedicationByBarcode(scannedId);
        if (medicationData) {
          methods.setValue(
            "medication_name",
            medicationData.medication_name || ""
          );
          methods.setValue("dosage", medicationData.dosage || "");
          methods.setValue("instructions", medicationData.instructions || "");
          setIsScanning(false);
          toast({
            title: "Medication found!",
            description: `${medicationData.medication_name} has been loaded.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Not found",
            description: "Medication not found. Please enter details manually.",
          });
        }
      } catch (error: any) {
        console.error("Scan error:", error);
        toast({
          variant: "destructive",
          title: "Scan failed",
          description:
            "Unable to read QR code. Please try again or enter details manually.",
        });
      }
    };
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
    setIsSubmitting(true);

    try {
      await createMedication(residentId, methods.getValues());
      toast({
        title: "Success",
        description: `${methods.watch(
          "medication_name"
        )} has been added to the medication list.`,
      });
      reset({
        medication_name: "",
        dosage: "",
        schedule_type: "day",
        start_date: "",
        instructions: "",
        times_of_day: [],
        days_of_week: [],
      });
      onMedicationAdded();
      onClose();
    } catch (error: any) {
      console.error("Error adding medication:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to add medication. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a handler for dialog close to reset scheduler states
  const handleDialogClose = useCallback(() => {
    // Reset form values
    reset({
      medication_name: "",
      dosage: "",
      schedule_type: "day",
      start_date: "",
      end_date: "",
      instructions: "",
      times_of_day: [],
      days_of_week: [],
      repeat: 1,
    });

    // Reset other state
    setStartDate(undefined);
    setEndDate(undefined);
    setIsScanning(false);

    // Call the original onClose
    onClose();
  }, [onClose, reset]);

  const handleClose = () => {
    if (isScanning) {
      setIsScanning(false);
    } else {
      handleDialogClose();
    }
  };

  return (
    <FormProvider {...methods}>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Add New Medication
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-4 px-1">
            {isScanning ? (
              <div className="space-y-4">
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/png"
                    videoConstraints={{
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                      facingMode: "environment",
                    }}
                    className="w-full rounded-lg border overflow-hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 left-4 bg-white rounded-full h-8 w-8"
                    onClick={() => setIsScanning(false)}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleScan}
                  className="w-full"
                  variant="default"
                >
                  <Scan className="mr-1 h-4 w-4" />
                  Scan Medication
                </Button>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                <Button
                  onClick={() => setIsScanning(true)}
                  className="w-full"
                  variant="outline"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Medication QR Code
                </Button>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="medication_name">Medication Name</Label>
                    <Input
                      id="medication_name"
                      {...register("medication_name")}
                      placeholder="Enter medication name"
                    />
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
                            value as "custom" | "day" | "week"
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
                    <DayMedicationScheduler onDialogClose={handleDialogClose} />
                  )}
                  {methods.watch("schedule_type") == "week" && (
                    <WeekMedicationScheduler
                      onDialogClose={handleDialogClose}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !methods.watch("start_date") &&
                                "text-muted-foreground"
                            )}
                          >
                            {methods.watch("start_date") ? (
                              format(
                                methods.watch("start_date"),
                                "MMMM d, yyyy"
                              )
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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

                    <div className="space-y-1.5">
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !methods.watch("end_date") &&
                                "text-muted-foreground"
                            )}
                          >
                            {methods.watch("end_date") ? (
                              format(methods.watch("end_date")!, "MMMM d, yyyy")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            disabled={(date) =>
                              startDate ? date < startDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      {...register("instructions")}
                      placeholder="Special instructions for administration"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {!isScanning && (
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={handleClose} className="mr-2">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(handleSubmitForm)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Medication"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
};

export default CreateMedication;
