import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clipboard, Pencil, Pill, Trash2 } from "lucide-react";
import React from "react";

interface MedicationProps {
  medication: {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    instructions?: string;
  };
  onEdit: (medication: any) => void;
}

const MedicationDisplay: React.FC<MedicationProps> = ({
  medication,
  onEdit,
}) => {
  return (
    <Card className="w-full border border-gray-200 shadow-md rounded-lg bg-white p-3">
      <CardHeader className="flex items-right justify-between px-4 py-2">
        <div className="flex-1 flex items-center space-x-2">
          <CardTitle className="text-base font-semibold text-gray-800">
            {medication.medication_name}
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium px-2 py-1">
            {medication.frequency}
          </Badge>
          <Button
            type="button"
            aria-label="Edit medication"
            className="bg-blue-500 text-white hover:text-white-600 transition"
            onClick={() => onEdit(medication)}
          >
            <Pencil size={18} />
          </Button>
          <Button
            type="button"
            aria-label="Delete medication"
            className="bg-white-500 text-red-500 hover:bg-white transition"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 mt-1 text-sm text-gray-700 px-4">
        <div className="flex items-center space-x-2">
          <Pill size={16} className="text-gray-500" />
          <p>
            <strong>Dosage:</strong> {medication.dosage}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-500" />
          <p>
            <strong>Start Date:</strong> {medication.start_date}
          </p>
        </div>

        {medication.end_date && (
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <p>
              <strong>End Date:</strong> {medication.end_date}
            </p>
          </div>
        )}

        {medication.instructions && (
          <div className="flex items-center space-x-2">
            <Clipboard size={16} className="text-gray-500" />
            <p>
              <strong>Instructions:</strong> {medication.instructions}
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 text-gray-600 text-sm">
          <strong>Prescribed by:</strong> Doctor David Lim
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationDisplay;
