import { ResidentRecord } from "@/types/resident"; // Adjust the import as necessary

export const createMedicalRecord = async (
  templateType: string,
  residentId: string,
  record: Record<string, any>,
): Promise<ResidentRecord> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/medical/records/${templateType}?resident_id=${encodeURIComponent(residentId)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error(`Error creating medical record: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("createMedicalRecord error:", error);
    throw error;
  }
};
