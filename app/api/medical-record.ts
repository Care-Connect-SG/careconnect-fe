import { ResidentRecord } from "@/types/resident";
import { MedicalRecord, MedicalRecordType } from "@/types/medical-record";

export const createMedicalRecord = async (
  recordType: MedicalRecordType,
  residentId: string,
  recordData: any
): Promise<MedicalRecord> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-records/`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record_type: recordType,
        resident_id: residentId,
        record_data: recordData
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error creating medical record");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("createMedicalRecord error:", error);
    throw error;
  }
};

export async function getMedicalRecordsByResident(residentId: string): Promise<MedicalRecord[]> {
  try {
    console.log(`Fetching medical records for resident: ${residentId}`);
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-records/resident/${residentId}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch medical records: ${errorText}`);
      throw new Error(`Failed to fetch medical records: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Received ${data.length} medical records:`, data);
    return data;
  } catch (error) {
    console.error('Error in getMedicalRecordsByResident:', error);
    throw error;
  }
}

export async function updateMedicalRecord(
  recordId: string,
  recordType: MedicalRecordType,
  residentId: string,
  updateData: any
): Promise<MedicalRecord> {
  try {
    // Remove any _id or id fields from the update data
    const { _id, id, ...cleanedData } = updateData;
    
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-records/${recordId}?record_type=${recordType}&resident_id=${encodeURIComponent(residentId)}`;
    
    console.log('Updating medical record:', {
      url,
      recordType,
      residentId,
      cleanedData
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedData),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error updating medical record");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error updating medical record:", error);
    throw error;
  }
}

export async function deleteMedicalRecord(
  recordId: string,
  recordType: MedicalRecordType,
  residentId: string
): Promise<void> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-records/${recordId}?record_type=${recordType}&resident_id=${encodeURIComponent(residentId)}`;
    
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error deleting medical record");
    }
  } catch (error: any) {
    console.error("Error deleting medical record:", error);
    throw error;
  }
}
