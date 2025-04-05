import { MedicationAdministrationLog } from "@/types/medication-log";

export const getMedicationLogs = async (
  residentId: string,
  date?: string,
): Promise<MedicationAdministrationLog[]> => {
  const params = new URLSearchParams();
  params.append("resident_id", residentId);
  if (date) params.append("date", date);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/medication-logs/?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    return await response.json();
  } catch (error) {
    console.error("getMedicationLogs error:", error);
    return [];
  }
};

export const logMedicationAdministration = async (
  residentId: string,
  medicationId: string,
): Promise<MedicationAdministrationLog> => {
  const params = new URLSearchParams();
  params.append("resident_id", residentId);
  params.append("medication_id", medicationId);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/medication-logs/?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Failed to log medication administration",
      );
    }

    return await response.json();
  } catch (error) {
    console.error("logMedicationAdministration error:", error);
    throw error;
  }
};
