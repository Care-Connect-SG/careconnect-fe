import { MedicationRecord } from "@/types/medication";

export const getMedicationsForResident = async (
  residentId: string,
): Promise<MedicationRecord[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/medications`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(
        errData.detail || "Error fetching medications for the resident",
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching medications for the resident:", error);
    return [];
  }
};

export const createMedication = async (
  residentId: string,
  medicationData: any,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/medications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicationData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(
        errData.detail || "Error creating medication for the resident",
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating medication for the resident:", error);
    return null;
  }
};

export const updateMedication = async (
  residentId: string,
  medicationData: any,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/medications/${medicationData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicationData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(
        errData.detail || "Error updating medication for the resident",
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating medication for the resident:", error);
    return null;
  }
};
