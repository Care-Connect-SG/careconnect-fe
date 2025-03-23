"use client";

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

// Simple polyfill for browsers without BarcodeDetector
if (typeof window !== "undefined" && !window.BarcodeDetector) {
  window.BarcodeDetector = class {
    async detect() {
      return [];
    }
    static getSupportedFormats() {
      return ["code_128"];
    }
  };
}

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
import { useState } from "react";
// import { medications } from "@/app/api/standardmedications";

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

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSupported, setScanSupported] = useState(true);

  const handleScan = async (result: { data: string } | null) => {
    if (result?.data) {
      const barcode = result.data;
      console.log("Scanned Barcode:", barcode);

      try {
        const medicationData = await fetchMedicationByBarcode(barcode);

        if (medicationData) {
          setForm((prev) => ({
            ...prev,
            medication_name: medicationData.medication_name || "",
            dosage: medicationData.dosage || "",
            frequency: medicationData.frequency || "",
            instructions: medicationData.instructions || "",
            // Keep existing dates or reset as needed
          }));
          setScanError(null);
          setIsScanning(false);
        } else {
          setScanError("❌ Medication not found. Please enter manually.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setScanError("❌ Error fetching medication data. Please try again.");
      }
    }
  };

  const handleError = (err: any) => {
    console.error("Barcode Scan Error:", err);
    setScanError("❌ Unable to read barcode. Please try again.");
  };

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

        <ScrollArea className="max-h-[70vh] overflow-y-auto px-1">
          {/* Scan Button
          <Button onClick={() => setIsScanning(!isScanning)} variant="outline" className="w-full">
            {isScanning ? "Cancel Scan" : "Scan Medication Barcode"}
          </Button>

          {/* Barcode Scanner */}
          {/* {isScanning && (
            <div className="mt-4">
              {isScanning && (
                <div className="mt-4">
                  {scanSupported ? (
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <BarcodeScanner
                        options={{ formats: ['code_128'] }}
                        onCapture={handleScan}
                        onError={handleError}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-600">
                        ⚠️ Barcode scanning not supported in your browser.<br />
                        Supported browsers: Chrome 83+, Edge 83+, Android WebView
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {scanError && <p className="text-red-500">{scanError}</p>} */}

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
