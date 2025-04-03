"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, IdCard, ImageIcon } from "lucide-react";
import React, { useState, useRef } from "react";

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
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      await extractData(selectedFile);
    }
  };

  const extractData = async (fileToExtract: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("idCard", fileToExtract);

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
      toast({
        title: "Failed to upload",
        description: err.message || "Error extracting data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);

      await extractData(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-2">
      <Card
        className={`border-2 border-dashed p-3 flex flex-col items-center justify-center bg-gray-50 cursor-pointer transition-colors ${
          loading ? "opacity-70 pointer-events-none" : "hover:bg-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Input
          id="id-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {loading ? (
          <div className="flex items-center py-1 space-x-2">
            <Spinner />
            <p className="text-sm text-gray-500">Extracting data...</p>
          </div>
        ) : (
          <>
            {file ? (
              <div className="flex items-center space-x-2">
                <FileIcon className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <IdCard className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload IC
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ExtractIDCard;
