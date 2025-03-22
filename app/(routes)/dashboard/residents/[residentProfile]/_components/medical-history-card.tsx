"use client";

import React from "react";

interface MedicalRecordCardProps {
  record: any; // You can later narrow this type to a union type for each template.
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record }) => {
  let title = "";
  let details = "";

  if ("condition_name" in record) {
    title = `Condition: ${record.condition_name}`;
    details = `Diagnosed: ${record.date_of_diagnosis} | Physician: ${record.treating_physician} | Status: ${record.current_status}`;
  } else if ("allergen" in record) {
    title = `Allergy: ${record.allergen}`;
    details = `Reaction: ${record.reaction_description} | Noted: ${record.date_first_noted} | Severity: ${record.severity}`;
  } else if ("illness_name" in record) {
    title = `Chronic Illness: ${record.illness_name}`;
    details = `Onset: ${record.date_of_onset} | Physician: ${record.managing_physician}`;
  } else if ("procedure" in record) {
    title = `Surgical: ${record.procedure}`;
    details = `Date: ${record.date} | Surgeon: ${record.surgeon} | Hospital: ${record.hospital}`;
  } else if ("vaccine" in record) {
    title = `Immunization: ${record.vaccine}`;
    details = `Administered: ${record.date_administered} | Next Due: ${record.next_due_date || "N/A"}`;
  } else {
    title = "Unknown Record";
    details = "";
  }

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{details}</p>
    </div>
  );
};

export default MedicalRecordCard;
