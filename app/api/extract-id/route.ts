import { cleanName, formatDateToInput } from "@/lib/utils";
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { NextRequest, NextResponse } from "next/server";

const modelId = "prebuilt-idDocument";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("idCard") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    const endpoint = process.env.AZURE_ENDPOINT;
    const apiKey = process.env.AZURE_OCR_KEY;

    if (!endpoint || !apiKey) {
      return NextResponse.json(
        { message: "Azure Document Analysis credentials are not configured" },
        { status: 500 },
      );
    }

    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey),
    );

    const bytes = await file.arrayBuffer();

    const poller = await client.beginAnalyzeDocument(modelId, bytes);
    const result = await poller.pollUntilDone();

    const extracted: any = {};
    const doc = result.documents?.[0];

    if (doc?.fields) {
      const fields = doc.fields;

      const idField = fields["DocumentNumber"] ?? fields["IDNumber"];
      if (idField?.kind === "string") {
        extracted.nricNumber = idField.value;
      }

      const dobField = fields["DateOfBirth"] ?? fields["BirthDate"];
      if (dobField?.kind === "date" && dobField.value) {
        extracted.dateOfBirth = formatDateToInput(dobField.value);
      }

      const first = fields["FirstName"];
      const last = fields["LastName"];
      if (first?.kind === "string" && last?.kind === "string") {
        extracted.fullName = `${first.value} ${last.value}`;
      } else {
        const nameField = fields["Name"] ?? fields["FullName"];
        if (nameField?.kind === "string" && nameField.value) {
          extracted.fullName = cleanName(nameField.value);
        }
      }

      const genderField = fields["Sex"] ?? fields["Gender"];
      if (genderField?.kind === "string" && genderField.value !== undefined) {
        const genderValue = genderField.value.trim().toLowerCase();
        if (genderValue === "m" || genderValue === "male") {
          extracted.gender = "Male";
        } else if (genderValue === "f" || genderValue === "female") {
          extracted.gender = "Female";
        }
      }

      if (!extracted.fullName && result.content) {
        const match = result.content.match(/Name\s+([A-Z\s]+?)\s+Race/i);
        if (match?.[1]) {
          extracted.fullName = cleanName(match[1]);
        }
      }

      if (!extracted.gender && result.content) {
        const sexMatch = result.content.match(/Sex\s+([MF])/i);
        if (sexMatch?.[1]) {
          extracted.gender =
            sexMatch[1].toUpperCase() === "M" ? "Male" : "Female";
        }
      }
    }

    return NextResponse.json(extracted);
  } catch (error: any) {
    console.error("Error extracting ID data:", error);
    return NextResponse.json(
      { message: error.message || "Error processing ID card" },
      { status: 500 },
    );
  }
}
