import { MedicationRecord } from "@/types/medication";

/**
 * Fetch medication records for a specific resident.
 */
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
      throw new Error(`Error fetching medications: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching medications:", error);
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
      throw new Error(`Error creating medication: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating medication:", error);
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
      throw new Error(`Error updating medication: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating medication:", error);
    return null;
  }
};
