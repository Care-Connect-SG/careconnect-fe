import { ResidentRecord } from "@/types/resident"; // adjust the path and type name as needed

/**
 * Fetch all resident records.
 * This calls the backend endpoint GET /residents
 */
export const getResidents = async (): Promise<ResidentRecord[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching residents: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getResidents error:", error);
    throw error;
  }
};

export const getResidentById = async (residentId: string): Promise<ResidentRecord> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error(`Error fetching resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  };

  export const updateResident = async (
    residentId: string,
    updateData: any 
  ): Promise<ResidentRecord> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );
    if (!response.ok) {
      throw new Error(`Error updating resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  };
  export const updateResidentNurse = async (
    residentId: string,
    updateData: {
      full_name: string;
      gender: string;
      date_of_birth: string;
      nric_number: string;
      emergency_contact_name: string;
      emergency_contact_number: string;
      relationship: string;
      room_number: string;
      additional_notes?: string;
      additional_notes_timestamp?: string;
      primary_nurse: string;
    }
  ): Promise<ResidentRecord> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );
    if (!response.ok) {
      throw new Error(`Error updating resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  };