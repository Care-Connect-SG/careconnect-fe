import { RegistrationCreate, ResidentRecord } from "@/types/resident";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching residents");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getResidents error:", error);
    throw error;
  }
};

export const getResidentsByPage = async (
  page: number,
  nurse?: string,
): Promise<ResidentRecord[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BE_API_URL}/residents?page=${page}`;
    if (nurse) {
      url += `&nurse=${encodeURIComponent(nurse)}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching residents by page");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getResidentsByPage error:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching resident by ID");
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
    const localDate = new Date();
    const localISOString = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000,
    ).toISOString();

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
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error updating resident details");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("updateResident error:", error);
    throw error;
  }
};

export async function removeResidentProfilePicture(
  resident: ResidentRecord,
): Promise<ResidentRecord> {
  try {
    const updatedResident = await updateResident(resident.id, {
      ...resident,
      photograph: null,
    });

    return updatedResident;
  } catch (error) {
    console.error("Error removing profile picture:", error);
    throw error;
  }
}

export async function editResidentProfilePicture(
  resident: ResidentRecord,
  formData: FormData,
): Promise<ResidentRecord> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/images/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error uploading profile picture");
    }

    const result = await response.json();

    const updatedResident = await updateResident(resident.id, {
      ...resident,
      photograph: result.data.url,
    });

    return updatedResident;
  } catch (error) {
    console.error("Error editing profile picture:", error);
    throw error;
  }
}

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
      const errData = await response.json();
      throw Error(errData.detail || "Error updating resident nurse");
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
      const errData = await response.json();
      throw Error(errData.detail || "Error deleting resident");
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
      const errData = await response.json();
      throw Error(errData.detail || "Error creating new resident");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("createResident error:", error);
    throw error;
  }
};
