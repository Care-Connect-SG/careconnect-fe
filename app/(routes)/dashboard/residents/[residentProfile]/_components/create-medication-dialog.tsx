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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BrowserQRCodeReader } from "@zxing/browser";
import { format } from "date-fns";
import { CalendarIcon, QrCode, Scan, Undo } from "lucide-react";
import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { DayMedicationScheduler, WeekMedicationScheduler } from "./scheduler";
import { z } from "zod";


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
  
  const initialForm = {
    medication_name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
    instructions: "",
  };

  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

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
          img,
        );
        const scannedId = result.getText();

        toast({
          description: "Scanning for medication...",
        });

        const medicationData = await fetchMedicationByBarcode(scannedId);
        if (medicationData) {
          setForm((prev) => ({
            ...prev,
            medication_name: medicationData.medication_name || "",
            dosage: medicationData.dosage || "",
            frequency: medicationData.frequency || "",
            instructions: medicationData.instructions || "",
          }));
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
    } else {
      setForm({
        ...form,
        start_date: "",
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

  // const validateForm = () => {
  //   if (!form.medication_name.trim()) {
  //     toast({
  //       variant: "destructive",
  //       title: "Missing information",
  //       description: "Medication name is required.",
  //     });
  //     return false;
  //   }

  //   if (!form.dosage.trim()) {
  //     toast({
  //       variant: "destructive",
  //       title: "Missing information",
  //       description: "Dosage is required.",
  //     });
  //     return false;
  //   }

  //   if (!form.frequency.trim()) {
  //     toast({
  //       variant: "destructive",
  //       title: "Missing information",
  //       description: "Frequency is required.",
  //     });
  //     return false;
  //   }

  //   if (!form.start_date) {
  //     toast({
  //       variant: "destructive",
  //       title: "Missing information",
  //       description: "Start date is required.",
  //     });
  //     return false;
  //   }

  //   return true;
  // };

  const handleSubmit = async () => {
    // if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createMedication(residentId, form);
      toast({
        title: "Success",
        description: `${form.medication_name} has been added to the medication list.`,
      });
      onMedicationAdded();
      setForm(initialForm);
      setStartDate(undefined);
      setEndDate(undefined);
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

  const handleClose = () => {
    if (isScanning) {
      setIsScanning(false);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add New Medication
          </DialogTitle>
        </DialogHeader>

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
            <Button onClick={handleScan} className="w-full" variant="default">
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
                  name="medication_name"
                  value={form.medication_name}
                  onChange={handleChange}
                  placeholder="Enter medication name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    name="dosage"
                    value={form.dosage}
                    onChange={handleChange}
                    placeholder="e.g., 10mg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="frequency">Schedule</Label>
                  <Select>
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

              {/* <WeekMedicationScheduler /> */}
              <DayMedicationScheduler />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
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
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  placeholder="Special instructions for administration"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {!isScanning && (
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={handleClose} className="mr-2">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Medication"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateMedication;
