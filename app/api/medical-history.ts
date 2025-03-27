import { MedicalHistory, MedicalHistoryType } from "@/types/medical-history";

export const createMedicalHistory = async (
  recordType: MedicalHistoryType,
  residentId: string,
  recordData: any,
): Promise<MedicalHistory> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-history/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_type: recordType,
          resident_id: residentId,
          record_data: recordData,
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Error creating medical record");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createMedicalHistory:", error);
    throw error;
  }
};

export const getMedicalHistoryByResident = async (
  residentId: string,
): Promise<MedicalHistory[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-history/resident/${residentId}`,
      { method: "GET" },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.detail ||
          `Failed to fetch medical records: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getMedicalHistorysByResident:", error);
    throw error;
  }
};

export const updateMedicalHistory = async (
  recordId: string,
  recordType: MedicalHistoryType,
  residentId: string,
  updateData: any,
): Promise<void> => {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BE_API_URL
      }/medical-history/${recordId}?record_type=${recordType}&resident_id=${encodeURIComponent(
        residentId,
      )}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Update medical history error response:", errorData);
      throw new Error(errorData.detail || "Error updating medical record");
    }
  } catch (error) {
    console.error("Error in updateMedicalHistory:", error);
    throw error;
  }
};

export const deleteMedicalHistory = async (
  recordId: string,
  recordType: MedicalHistoryType,
  residentId: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/medical-history/${recordId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_type: recordType,
          resident_id: residentId,
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Error deleting medical record");
    }
  } catch (error) {
    console.error("Error in deleteMedicalHistory:", error);
    throw error;
  }
};
