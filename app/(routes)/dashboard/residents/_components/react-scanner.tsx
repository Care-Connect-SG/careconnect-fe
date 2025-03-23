"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { fetchMedicationByBarcode } from "@/app/api/fixedmedication";

const BarcodeScanner: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [barcode, setBarcode] = useState<string | null>(null);
    const [medication, setMedication] = useState<any>(null);

    const captureAndScan = useCallback(async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.src = imageSrc;

        img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const luminanceSource = new BrowserMultiFormatReader();

            try {
                const result = await luminanceSource.decodeFromImageElement(img);
                console.log("✅ Scanned barcode:", result.getText());
                setBarcode(result.getText());

                const medicationData = await fetchMedicationByBarcode(result.getText());
                if (medicationData) {
                    console.log("💊 Medication fetched:", medicationData);
                    setMedication(medicationData);
                } else {
                    console.warn("No medication found for ID:", result.getText());
                }
            } catch (err: any) {
                console.error("Barcode scan error (likely no barcode found):", err.message);
            }
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            captureAndScan();
        }, 1500); // scan every 1.5s

        return () => clearInterval(interval);
    }, [captureAndScan]);

    return (
        <div className="space-y-4">
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={{
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "environment"
                }}
                className="rounded-lg border"
            />

            {barcode && <p>📦 Detected Barcode: <strong>{barcode}</strong></p>}

            {medication && (
                <div className="p-4 border rounded bg-gray-50">
                    <h2 className="font-bold text-lg mb-2">💊 Medication Info</h2>
                    <p><strong>Name:</strong> {medication.medication_name}</p>
                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                    <p><strong>Frequency:</strong> {medication.frequency}</p>
                    <p><strong>Instructions:</strong> {medication.instructions}</p>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;
