"use client";

import { getMedicationById } from "@/app/api/medication";
import { logMedicationAdministration } from "@/app/api/medication-log";
import { getResidentById } from "@/app/api/resident";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
    Camera,
    CheckCircle,
    Clock,
    Pill,
    RotateCcw,
    User,
    XCircle,
} from "lucide-react";
import React, { useState } from "react";
import Webcam from "react-webcam";

interface BCMA_ScannerProps {
    onSuccess?: () => void;
}

const BCMA_Scanner: React.FC<BCMA_ScannerProps> = ({ onSuccess }) => {
    const { toast } = useToast();
    const [residentId, setResidentId] = useState("");
    const [residentName, setResidentName] = useState("");
    const [medicationId, setMedicationId] = useState("");
    const [medicationInfo, setMedicationInfo] = useState<{
        medication_name: string;
        dosage: string;
        frequency: string;
    } | null>(null);
    const [step, setStep] = useState<"resident" | "medication">("resident");
    const [matchStatus, setMatchStatus] = useState<
        "pending" | "matched" | "mismatch" | "error"
    >("pending");
    const [isScanning, setIsScanning] = useState(false);
    const webcamRef = React.useRef<Webcam>(null);

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
                const scannedText = result.getText();

                if (step === "resident") {
                    const res = await getResidentById(scannedText);
                    if (res?.id) {
                        setResidentId(res.id);
                        setResidentName(res.full_name);
                        setStep("medication");
                        toast({
                            title: "Resident Identified",
                            description: `${res.full_name} successfully scanned.`,
                            variant: "default",
                        });
                        return;
                    } else {
                        throw new Error("Resident not found");
                    }
                }

                if (step === "medication") {
                    if (!residentId) {
                        toast({
                            title: "Error",
                            description: "Please scan resident QR first.",
                            variant: "destructive",
                        });
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
                            toast({
                                title: "Medication Scanned",
                                description: `${med.medication_name} successfully identified.`,
                                variant: "default",
                            });
                        } else {
                            toast({
                                title: "Medication Error",
                                description: "This resident is not prescribed this medication.",
                                variant: "destructive",
                            });
                        }
                    } catch {
                        toast({
                            title: "Medication Error",
                            description: "This resident is not prescribed this medication.",
                            variant: "destructive",
                        });
                    }

                    return;
                }

                toast({
                    title: "Scan Error",
                    description: "Invalid QR code scanned.",
                    variant: "destructive",
                });
            } catch (err: any) {
                console.error(err);
                toast({
                    title: "Scan Failed",
                    description: err.message || "Please try again.",
                    variant: "destructive",
                });
            }
        };
    };

    const handleMatchCheck = async () => {
        if (!residentId || !medicationId) return;

        try {
            const med = await getMedicationById(residentId, medicationId);

            if (med && med.resident_id === residentId) {
                setMatchStatus("matched");
                toast({
                    title: "Match Confirmed",
                    description: "This medication is prescribed to the resident.",
                    variant: "default",
                });
            } else {
                setMatchStatus("mismatch");
                toast({
                    title: "Medication Mismatch",
                    description: "This resident is not prescribed this medication.",
                    variant: "destructive",
                });
            }
        } catch (e) {
            setMatchStatus("error");
            toast({
                title: "Verification Error",
                description: "Could not verify medication match.",
                variant: "destructive",
            });
        }
    };

    const handleLog = async () => {
        try {
            await logMedicationAdministration(residentId, medicationId);
            toast({
                title: "Success",
                description: "Medication administration successfully logged.",
                variant: "default",
            });
            resetScanner();
            if (onSuccess) onSuccess();
        } catch (e) {
            toast({
                title: "Log Error",
                description: "Failed to log medication administration.",
                variant: "destructive",
            });
        }
    };

    const resetScanner = () => {
        setResidentId("");
        setResidentName("");
        setMedicationId("");
        setMedicationInfo(null);
        setMatchStatus("pending");
        setStep("resident");
    };

    return (
        <Card className="p-6 shadow-sm border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Pill className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-medium text-gray-900">
                        Medication Scanner
                    </h2>
                    <p className="text-sm text-gray-500">
                        Scan resident and medication QR codes
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <div className="rounded-lg bg-blue-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                            {step === "resident" ? "1" : "2"}
                        </div>
                        <span className="font-medium text-blue-900">
                            {step === "resident" ? "Scan Resident" : "Scan Medication"}
                        </span>
                    </div>
                    <Button
                        onClick={() => setIsScanning(!isScanning)}
                        variant={isScanning ? "destructive" : "secondary"}
                        size="sm"
                        className="gap-1.5"
                    >
                        <Camera className="h-4 w-4" />
                        {isScanning ? "Stop Camera" : "Start Camera"}
                    </Button>
                </div>

                {isScanning && (
                    <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/png"
                                videoConstraints={{ facingMode: "environment" }}
                                className="w-full object-cover"
                                height={300}
                            />
                        </div>
                        <Button onClick={handleScan} className="w-full">
                            {step === "resident" ? (
                                <>
                                    <User className="mr-2 h-4 w-4" /> Scan Resident ID
                                </>
                            ) : (
                                <>
                                    <Pill className="mr-2 h-4 w-4" /> Scan Medication
                                </>
                            )}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <h3 className="font-medium text-gray-900">Resident</h3>
                        </div>
                        {residentName ? (
                            <div>
                                <p className="font-medium">{residentName}</p>
                                <p className="text-xs text-gray-500 mt-1">ID: {residentId}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Not scanned yet</p>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Pill className="h-4 w-4 text-blue-500" />
                            <h3 className="font-medium text-gray-900">Medication</h3>
                        </div>
                        {medicationInfo ? (
                            <div>
                                <p className="font-medium">{medicationInfo.medication_name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {medicationInfo.dosage} – {medicationInfo.frequency}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Not scanned yet</p>
                        )}
                    </div>
                </div>

                {residentId && medicationId && matchStatus === "pending" && (
                    <Button
                        onClick={handleMatchCheck}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> Verify Medication Match
                    </Button>
                )}

                {matchStatus === "matched" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">
                                Match confirmed. Safe to administer.
                            </span>
                        </div>
                        <Button
                            onClick={handleLog}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Clock className="mr-2 h-4 w-4" /> Administer & Log
                        </Button>
                    </div>
                )}

                {matchStatus === "mismatch" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <div>
                                <span className="font-medium text-red-800">
                                    Medication mismatch
                                </span>
                                <p className="text-sm text-red-700 mt-1">
                                    This resident is not prescribed this medication.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {(matchStatus === "matched" || matchStatus === "mismatch") && (
                    <Button
                        onClick={resetScanner}
                        variant="outline"
                        className="flex items-center justify-center"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Scanner
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default BCMA_Scanner;
