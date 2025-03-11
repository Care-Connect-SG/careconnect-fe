import { RegistrationCreate, ResidentRecord } from "@/types/resident";

export const getResidents = async (): Promise<ResidentRecord[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
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

export const getResidentById = async (
  residentId: string,
): Promise<ResidentRecord> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) {
      throw new Error(`Error fetching resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getResidentById error:", error);
    throw error;
  }
};

export const updateResident = async (
  residentId: string,
  updateData: any,
): Promise<ResidentRecord> => {
  try {
    // Convert current local time to an ISO string that reflects your local time.
    const localDate = new Date();
    const localISOString = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();

    // Set the additional_notes_timestamp field in the payload.
    updateData.additional_notes_timestamp = localISOString;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      },
    );
    if (!response.ok) {
      throw new Error(`Error updating resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("updateResident error:", error);
    throw error;
  }
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
  },
): Promise<ResidentRecord> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      },
    );
    if (!response.ok) {
      throw new Error(`Error updating resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("updateResidentNurse error:", error);
    throw error;
  }
};

export const deleteResident = async (residentId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) {
      throw new Error(`Error deleting resident: ${response.statusText}`);
    }
  } catch (error) {
    console.error("deleteResident error:", error);
    throw error;
  }
};

export const createResident = async (
  newResidentData: RegistrationCreate,
): Promise<ResidentRecord> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/createNewRecord`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResidentData),
      },
    );
    if (!response.ok) {
      throw new Error(`Error creating resident: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("createResident error:", error);
    throw error;
  }
};
