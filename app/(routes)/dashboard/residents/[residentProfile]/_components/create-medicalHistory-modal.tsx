"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { createMedicalRecord } from "../../../../../api/medicalHistory";

const CreateMedicalRecordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated?: () => void;
}> = ({ isOpen, onClose, onRecordCreated }) => {
  // Extract resident_id from URL (assumes route: /residents/{resident_id}/...)
  const { residentProfile } = useParams() as { residentProfile: string };
console.log(residentProfile)
  // Manage template type and dynamic form data.
  const [templateType, setTemplateType] = useState("condition");
  const [formData, setFormData] = useState<any>({});
  const [message, setMessage] = useState("");

  // When template type changes, reset formData with the appropriate fields.
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setTemplateType(newType);
    if (newType === "condition") {
      setFormData({
        condition_name: "",
        date_of_diagnosis: "",
        treating_physician: "",
        treatment_details: "",
        current_status: "",
      });
    } else if (newType === "allergy") {
      setFormData({
        allergen: "",
        reaction_description: "",
        date_first_noted: "",
        severity: "",
        management_notes: "",
      });
    } else if (newType === "chronic") {
      setFormData({
        illness_name: "",
        date_of_onset: "",
        managing_physician: "",
        current_treatment_plan: "",
        monitoring_parameters: "",
      });
    } else if (newType === "surgical") {
      setFormData({
        procedure: "",
        date: "",
        surgeon: "",
        hospital: "",
        complications: "",
      });
    } else if (newType === "immunization") {
      setFormData({
        vaccine: "",
        date_administered: "",
        administering_facility: "",
        next_due_date: "",
      });
    }
  };

  // Handle input changes for all fields.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call the API utility with the template type, resident_id, and form data.
      const createdRecord = await createMedicalRecord(templateType, residentProfile, formData);
      setMessage("Medical record created successfully.");
      console.log("Created record:", createdRecord);
      if (onRecordCreated) onRecordCreated();
      onClose(); 
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Type Selector */}
          <div>
            <Label htmlFor="templateType">Template Type</Label>
            <select
              id="templateType"
              value={templateType}
              onChange={handleTemplateChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="condition">Condition</option>
              <option value="allergy">Allergy</option>
              <option value="chronic">Chronic Illness</option>
              <option value="surgical">Surgical History</option>
              <option value="immunization">Immunization</option>
            </select>
          </div>

          {/* Render form fields based on selected template */}
          {templateType === "condition" && (
            <>
              <div>
                <Label htmlFor="condition_name">Condition Name</Label>
                <Input
                  id="condition_name"
                  name="condition_name"
                  value={formData.condition_name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_of_diagnosis">Date of Diagnosis</Label>
                <Input
                  type="date"
                  id="date_of_diagnosis"
                  name="date_of_diagnosis"
                  value={formData.date_of_diagnosis || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="treating_physician">Treating Physician</Label>
                <Input
                  id="treating_physician"
                  name="treating_physician"
                  value={formData.treating_physician || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="treatment_details">Treatment Details</Label>
                <textarea
                  id="treatment_details"
                  name="treatment_details"
                  value={formData.treatment_details || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="current_status">Current Status</Label>
                <Input
                  id="current_status"
                  name="current_status"
                  value={formData.current_status || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {templateType === "allergy" && (
            <>
              <div>
                <Label htmlFor="allergen">Allergen</Label>
                <Input
                  id="allergen"
                  name="allergen"
                  value={formData.allergen || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reaction_description">Reaction Description</Label>
                <Input
                  id="reaction_description"
                  name="reaction_description"
                  value={formData.reaction_description || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_first_noted">Date First Noted</Label>
                <Input
                  type="date"
                  id="date_first_noted"
                  name="date_first_noted"
                  value={formData.date_first_noted || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Input
                  id="severity"
                  name="severity"
                  value={formData.severity || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="management_notes">Management Notes</Label>
                <textarea
                  id="management_notes"
                  name="management_notes"
                  value={formData.management_notes || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </>
          )}

          {templateType === "chronic" && (
            <>
              <div>
                <Label htmlFor="illness_name">Illness Name</Label>
                <Input
                  id="illness_name"
                  name="illness_name"
                  value={formData.illness_name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_of_onset">Date of Onset</Label>
                <Input
                  type="date"
                  id="date_of_onset"
                  name="date_of_onset"
                  value={formData.date_of_onset || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="managing_physician">Managing Physician</Label>
                <Input
                  id="managing_physician"
                  name="managing_physician"
                  value={formData.managing_physician || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="current_treatment_plan">Current Treatment Plan</Label>
                <textarea
                  id="current_treatment_plan"
                  name="current_treatment_plan"
                  value={formData.current_treatment_plan || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="monitoring_parameters">Monitoring Parameters</Label>
                <Input
                  id="monitoring_parameters"
                  name="monitoring_parameters"
                  value={formData.monitoring_parameters || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {templateType === "surgical" && (
            <>
              <div>
                <Label htmlFor="procedure">Procedure</Label>
                <Input
                  id="procedure"
                  name="procedure"
                  value={formData.procedure || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="surgeon">Surgeon</Label>
                <Input
                  id="surgeon"
                  name="surgeon"
                  value={formData.surgeon || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hospital">Hospital</Label>
                <Input
                  id="hospital"
                  name="hospital"
                  value={formData.hospital || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="complications">Complications</Label>
                <textarea
                  id="complications"
                  name="complications"
                  value={formData.complications || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </>
          )}

          {templateType === "immunization" && (
            <>
              <div>
                <Label htmlFor="vaccine">Vaccine</Label>
                <Input
                  id="vaccine"
                  name="vaccine"
                  value={formData.vaccine || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_administered">Date Administered</Label>
                <Input
                  type="date"
                  id="date_administered"
                  name="date_administered"
                  value={formData.date_administered || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="administering_facility">Administering Facility</Label>
                <Input
                  id="administering_facility"
                  name="administering_facility"
                  value={formData.administering_facility || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="next_due_date">Next Due Date</Label>
                <Input
                  type="date"
                  id="next_due_date"
                  name="next_due_date"
                  value={formData.next_due_date || ""}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default CreateMedicalRecordModal;
