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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BrowserQRCodeReader } from "@zxing/browser";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

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

  const [form, setForm] = useState(initialForm);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleScan = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      try {
        const result = await new BrowserQRCodeReader().decodeFromImageElement(
          img,
        );
        const scannedId = result.getText();

        const medicationData = await fetchMedicationByBarcode(scannedId);
        if (medicationData) {
          setForm((prev) => ({
            ...prev,
            medication_name: medicationData.medication_name || "",
            dosage: medicationData.dosage || "",
            frequency: medicationData.frequency || "",
            instructions: medicationData.instructions || "",
          }));
          setScanError(null);
          setIsScanning(false);
        } else {
          setScanError("❌ Medication not found. Please enter manually.");
        }
      } catch (error: any) {
        console.error("Scan error:", error);
        setScanError("❌ Unable to read QR code. Try again.");
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

  const handleSubmit = async () => {
    await createMedication(residentId, form);
    onMedicationAdded();
    setForm(initialForm);
    setStartDate(undefined);
    setEndDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add New Medication
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-y-auto px-1 space-y-6">
          <Button
            onClick={() => setIsScanning((prev) => !prev)}
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800"
          >
            {isScanning ? "Cancel Scan" : "📷 Scan Medication QR Code"}
          </Button>

          {isScanning && (
            <div className="relative mt-2 space-y-2">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={{
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "environment",
                }}
                className="w-full rounded-lg border"
              />
              <Button onClick={handleScan} className="w-full">
                🔍 Scan Now
              </Button>
              {scanError && <p className="text-red-500 mt-1">{scanError}</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="mt-4">
              <Label>Medication Name</Label>
              <Input
                name="medication_name"
                value={form.medication_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
              />
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
        </ScrollArea>

        <DialogFooter className="mt-6">
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
