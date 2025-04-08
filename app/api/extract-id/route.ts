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

    if (!process.env.AZURE_OCR_ENDPOINT || !process.env.AZURE_OCR_KEY) {
      return NextResponse.json(
        { message: "Missing Azure credentials" },
        { status: 500 },
      );
    }
    const client = new DocumentAnalysisClient(
      process.env.AZURE_OCR_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_OCR_KEY),
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
    }

    if (result.content) {
      const content = result.content;

      if (!extracted.fullName) {
        const namePatterns = [
          /Name\s+([A-Z\s]+?)\s+(?:Race|Sex|Gender)/i,
          /Name[\s:]+([A-Z\s]+)/i,
          /(?:^|\n)([A-Z][A-Z\s]+)\s+(?:SEX|GENDER|DOB)/i,
        ];

        for (const pattern of namePatterns) {
          const match = content.match(pattern);
          if (match?.[1]) {
            extracted.fullName = cleanName(match[1]);
            break;
          }
        }
      }

      if (!extracted.gender) {
        const genderPatterns = [
          /Sex\s*[:)]\s*([MF])/i,
          /Sex\s+([MF])/i,
          /Gender\s*[:)]\s*([MF])/i,
          /Gender\s+([MF])/i,
          /(?:^|\n|\s)(?:SEX|GENDER)[^\w\n]*([MF])(?:\s|$)/i,
          /\b(Male|Female)\b/i,
          /\b(M|F)\b(?!\w)/i,
        ];

        for (const pattern of genderPatterns) {
          const match = content.match(pattern);
          if (match?.[1]) {
            const genderValue = match[1].trim().toUpperCase();
            if (genderValue === "M" || genderValue === "MALE") {
              extracted.gender = "Male";
              break;
            } else if (genderValue === "F" || genderValue === "FEMALE") {
              extracted.gender = "Female";
              break;
            }
          }
        }
      }

      if (!extracted.nricNumber) {
        const nricPattern = /\b[STFG]\d{7}[A-Z]\b/i;
        const myKadPattern = /\b\d{6}[-\s]?\d{2}[-\s]?\d{4}\b/;

        const nricMatch = content.match(nricPattern);
        const myKadMatch = content.match(myKadPattern);

        if (nricMatch) {
          extracted.nricNumber = nricMatch[0].toUpperCase();
        } else if (myKadMatch) {
          extracted.nricNumber = myKadMatch[0].replace(/\s/g, "-");
        }
      }

      if (!extracted.dateOfBirth) {
        const dobPatterns = [
          /(?:Date of Birth|DOB|Birth Date)[^\d]+(0?[1-9]|[12][0-9]|3[01])[\/\.\-](0?[1-9]|1[012])[\/\.\-](\d{4})/i,
          /(?:Date of Birth|DOB|Birth Date)[^\d]+(\d{4})[\/\.\-](0?[1-9]|1[012])[\/\.\-](0?[1-9]|[12][0-9]|3[01])/i,
        ];

        for (const pattern of dobPatterns) {
          const match = content.match(pattern);
          if (match) {
            if (match[3] && match[3].length === 4) {
              extracted.dateOfBirth = `${match[3]}-${match[2].padStart(
                2,
                "0",
              )}-${match[1].padStart(2, "0")}`;
            } else if (match[1] && match[1].length === 4) {
              extracted.dateOfBirth = `${match[1]}-${match[2].padStart(
                2,
                "0",
              )}-${match[3].padStart(2, "0")}`;
            }
            break;
          }
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
