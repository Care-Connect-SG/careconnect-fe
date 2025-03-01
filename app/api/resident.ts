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
