"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import React, { useState } from "react";

export interface ExtractedIDData {
  fullName?: string;
  dateOfBirth?: string;
  nricNumber?: string;
  gender?: "Male" | "Female";
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

  const handleExtract = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("idCard", file);

      const response = await fetch("/api/extract-id", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error extracting data");
      }

      const extracted: ExtractedIDData = await response.json();
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
      <h3 className="font-semibold mb-2">Upload IC</h3>
      <Input type="file" accept="image/*" onChange={handleFileChange} />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <Button
        onClick={handleExtract}
        disabled={loading}
        className="mt-3 w-full"
      >
        {loading ? <Spinner /> : "Extract Details"}
      </Button>

      <div className="mt-6 border-t border-dotted border-gray-300"></div>
    </div>
  );
};

export default ExtractIDCard;
