"use client";

import { MedicalRecord } from "@/lib/schema/medicalRecordSchema";
import React from "react";

interface MedicalRecordCardProps {
  record: MedicalRecord;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record }) => {
  const { title, details } =
    "condition_name" in record
      ? {
          title: `Condition: ${record.condition_name}`,
          details: `Diagnosed: ${record.date_of_diagnosis} | Physician: ${record.treating_physician} | Status: ${record.current_status}`,
        }
      : "allergen" in record
        ? {
            title: `Allergy: ${record.allergen}`,
            details: `Reaction: ${record.reaction_description} | Noted: ${record.date_first_noted} | Severity: ${record.severity}`,
          }
        : "illness_name" in record
          ? {
              title: `Chronic Illness: ${record.illness_name}`,
              details: `Onset: ${record.date_of_onset} | Physician: ${record.managing_physician}`,
            }
          : "procedure" in record
            ? {
                title: `Surgical: ${record.procedure}`,
                details: `Date: ${record.date} | Surgeon: ${record.surgeon} | Hospital: ${record.hospital}`,
              }
            : "vaccine" in record
              ? {
                  title: `Immunization: ${record.vaccine}`,
                  details: `Administered: ${record.date_administered} | Next Due: ${
                    record.next_due_date || "N/A"
                  }`,
                }
              : {
                  title: "Unknown Record",
                  details: "",
                };

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{details}</p>
    </div>
  );
};

export default MedicalRecordCard;
