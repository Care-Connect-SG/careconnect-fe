"use client";

import React, { useState } from "react";
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
} from "@azure/ai-form-recognizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const endpoint = "https://careconnectsg.cognitiveservices.azure.com/";
const apiKey =
  "7EdcbifiVfvY3Ehn6cRUvSuBdrlYCHecgYKYIZatYFF9vJzBlqKZJQQJ99BDACqBBLyXJ3w3AAALACOG5e8J";
const modelId = "prebuilt-idDocument";

export interface ExtractedIDData {
  fullName?: string;
  dateOfBirth?: string;
  nricNumber?: string;
}

interface ExtractIDCardProps {
  onExtract: (data: ExtractedIDData) => void;
}

const ExtractIDCard: React.FC<ExtractIDCardProps> = ({ onExtract }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const formatDateToInput = (isoDate: string | Date): string => {
    const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const cleanName = (raw: string): string => {
    const noiseWords = ["K", "SINGAPURA", "REPUBLIC", "OF", "THE"];
    return raw
      .split(" ")
      .filter((word) => !noiseWords.includes(word.toUpperCase()))
      .join(" ")
      .trim();
  };

  const handleExtract = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    try {
      const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
      const fileBuffer = await file.arrayBuffer();
      const poller = await client.beginAnalyzeDocument(modelId, fileBuffer);
      const result = await poller.pollUntilDone();

      const extracted: ExtractedIDData = {};
      const doc = result.documents?.[0];

      if (doc?.fields) {
        const fields = doc.fields;

        // NRIC
        const idField = fields["DocumentNumber"] ?? fields["IDNumber"];
        if (idField?.kind === "string") {
          extracted.nricNumber = idField.value;
        }

        // DOB
        const dobField = fields["DateOfBirth"] ?? fields["BirthDate"];
        if (dobField?.kind === "date" && dobField.value) {
          extracted.dateOfBirth = formatDateToInput(dobField.value);
        }

        // Full Name: Prioritize FirstName + LastName
        const first = fields["FirstName"];
        const last = fields["LastName"];
        if (first?.kind === "string" && last?.kind === "string") {
          extracted.fullName = `${first.value} ${last.value}`;
        } else {
          // Fallback: Name or FullName field
          const nameField = fields["Name"] ?? fields["FullName"];
          if (nameField?.kind === "string" && nameField.value) {
            extracted.fullName = cleanName(nameField.value);
          }
        }

        // Debug log
        console.log("Fields returned:");
        for (const [key, field] of Object.entries(fields)) {
          console.log(`${key}:`, field.content);
        }

        // Fallback regex from raw text
        if (!extracted.fullName && result.content) {
          const match = result.content.match(/Name\s+([A-Z\s]+?)\s+Race/i);
          if (match?.[1]) {
            extracted.fullName = cleanName(match[1]);
          }
        }
      } else {
        setError("No document fields found in analysis result.");
      }

      onExtract(extracted);
    } catch (err: any) {
      console.error("Error extracting data:", err);
      setError(err.message || "Error extracting data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Upload ID Card</h3>
      <Input type="file" accept="image/*" onChange={handleFileChange} />
  
      {error && <p className="text-red-500 mt-2">{error}</p>}
  
      <Button
        onClick={handleExtract}
        disabled={loading}
        className="mt-3 w-full"
      >
        {loading ? "Extracting..." : "Extract Details"}
      </Button>
  
      <div className="mt-6 border-t border-dotted border-gray-300"></div>
    </div>
  );
  
};

export default ExtractIDCard;
