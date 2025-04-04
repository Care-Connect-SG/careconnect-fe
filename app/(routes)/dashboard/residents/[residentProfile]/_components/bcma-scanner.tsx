"use client";

import React, { useState } from "react";
import Webcam from "react-webcam";
import { BrowserQRCodeReader } from "@zxing/browser";
import { getResidentById } from "@/app/api/resident";
import { getMedicationById } from "@/app/api/medication";
import { logMedicationAdministration } from "@/app/api/medication-log";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BCMA_Scanner = () => {
    const [residentId, setResidentId] = useState("");
    const [residentName, setResidentName] = useState("");
    const [medicationId, setMedicationId] = useState("");
    const [medicationInfo, setMedicationInfo] = useState<{
        medication_name: string;
        dosage: string;
        frequency: string;
    } | null>(null);
    const [step, setStep] = useState<"resident" | "medication">("resident");
    const [matchStatus, setMatchStatus] = useState<"pending" | "matched" | "mismatch" | "error">("pending");
    const [logSuccess, setLogSuccess] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState("");
    const webcamRef = React.useRef<Webcam>(null);

    const handleScan = async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.src = imageSrc;

        img.onload = async () => {
            try {
                const result = await new BrowserQRCodeReader().decodeFromImageElement(img);
                const scannedText = result.getText();

                if (step === "resident") {
                    const res = await getResidentById(scannedText);
                    if (res?.id) {
                        setResidentId(res.id);
                        setResidentName(res.full_name);
                        setStep("medication");
                        setError("");
                        return;
                    } else {
                        throw new Error("Resident not found");
                    }
                }

                if (step === "medication") {
                    if (!residentId) {
                        setError("Please scan resident QR first.");
                        return;
                    }

                    try {
                        const med = await getMedicationById(residentId, scannedText);

                        if (med) {
                            setMedicationId(med.id);
                            setMedicationInfo({
                                medication_name: med.medication_name,
                                dosage: med.dosage,
                                frequency: med.frequency,
                            });
                            setError("");
                        } else {
                            setError("❌ This resident is not prescribed this medication.");
                        }

                        setError("");
                    } catch {
                        setError("❌ This resident is not prescribed this medication.");
                    }

                    return;
                }


                setError("Invalid QR code scanned.");
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Scan failed. Please try again.");
            }
        };
    };

    const handleMatchCheck = async () => {
        if (!residentId || !medicationId) return;

        try {
            const med = await getMedicationById(residentId, medicationId);

            if (med && med.resident_id === residentId) {
                setMatchStatus("matched");
            } else {
                setMatchStatus("mismatch");
            }
        } catch (e) {
            setMatchStatus("error");
        }
    };

    const handleLog = async () => {
        try {
            await logMedicationAdministration(residentId, medicationId);
            setLogSuccess(true);
        } catch (e) {
            setError("Failed to log medication administration.");
        }
    };

    const resetScanner = () => {
        setResidentId("");
        setResidentName("");
        setMedicationId("");
        setMedicationInfo(null);
        setMatchStatus("pending");
        setStep("resident");
        setLogSuccess(false);
        setError("");
    };

    return (
        <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">🩺 BCMA Medication Scanner</h2>

            <div className="flex flex-col gap-4">
                <Button onClick={() => setIsScanning(!isScanning)} className="w-full bg-blue-100 text-blue-900 hover:bg-blue-200">
                    {isScanning ? "🛑 Stop Camera" : "📷 Start Scanning"}
                </Button>

                {isScanning && (
                    <div className="space-y-4">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/png"
                            videoConstraints={{ facingMode: "environment" }}
                            className="w-full rounded-lg border"
                        />
                        <Button onClick={handleScan} className="w-full">
                            {step === "resident" ? "🧑 Scan Resident QR" : "💊 Scan Medication QR"}
                        </Button>
                    </div>
                )}

                <div className="space-y-2 text-sm">
                    <p><strong>👤 Resident:</strong> {residentName || "Not scanned"}</p>
                    {residentId && <p className="text-gray-500 text-xs">ID: {residentId}</p>}

                    <p><strong>💊 Medication:</strong> {medicationInfo?.medication_name || "Not scanned"}</p>
                    {medicationInfo && (
                        <p className="text-gray-500 text-xs">
                            {medicationInfo.dosage} – {medicationInfo.frequency}
                        </p>
                    )}
                </div>

                {residentId && medicationId && (
                    <>
                        <Button onClick={handleMatchCheck} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                            ✅ Check Match
                        </Button>

                        {matchStatus === "matched" && (
                            <div className="bg-green-100 text-green-800 font-semibold p-4 rounded-lg">
                                ✅ Match confirmed. You can proceed to administer.
                                <Button onClick={handleLog} className="mt-2 w-full">💉 Administer & Log</Button>
                            </div>
                        )}

                        {matchStatus === "mismatch" && (
                            <div className="bg-red-100 text-red-700 font-medium p-4 rounded-lg">
                                ❌ This resident is <u>not</u> prescribed this medication. Please verify.
                            </div>
                        )}
                    </>
                )}

                {logSuccess && (
                    <div className="bg-green-50 text-green-700 font-semibold p-4 rounded-lg flex flex-col gap-2">
                        ✅ Medication administration logged!
                        <Button onClick={resetScanner} variant="outline" className="w-fit">
                            🔁 Scan Another
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
                )}
            </div>
        </Card>
    );
};

export default BCMA_Scanner;
