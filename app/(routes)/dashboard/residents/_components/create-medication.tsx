"use client";

import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { BrowserQRCodeReader } from "@zxing/browser";
import { fetchMedicationByBarcode } from "@/app/api/fixedmedication";
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
        const result = await new BrowserQRCodeReader().decodeFromImageElement(img);
        const scannedId = result.getText();
        console.log("✅ Scanned QR code:", scannedId);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await createMedication(residentId, form);
    onMedicationAdded();
    setForm(initialForm); // ✅ Reset form after saving
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
              <Input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
              />
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
