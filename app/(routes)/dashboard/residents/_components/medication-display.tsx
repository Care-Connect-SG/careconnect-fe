import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MedicationProps {
    medication: {
        id: string;
        medication_name: string;
        dosage: string;
        frequency: string;
        start_date: string;
        end_date: string;
        instructions: string;
    };
}

const MedicationDisplay: React.FC<MedicationProps> = ({ medication }) => {
    return (
        <Card className="w-full border border-gray-300 shadow-lg rounded-xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-800">
                    {medication.medication_name}
                </CardTitle>
                <Badge variant="outline" className="text-sm font-medium">
                    {medication.frequency}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                    <strong>Dosage:</strong> {medication.dosage}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>Start Date:</strong> {medication.start_date}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>End Date:</strong> {medication.end_date}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>Instructions:</strong> {medication.instructions}
                </p>
            </CardContent>
        </Card>
    );
};

export default MedicationDisplay;
