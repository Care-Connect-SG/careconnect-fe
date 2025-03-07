import { CarePlanRecord } from "@/types/careplan";

/**
 * Fetch care plans for a specific resident.
 */
export const getCarePlansForResident = async (
  residentId: string,
): Promise<CarePlanRecord[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/careplan`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching care plans: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching care plans:", error);
    return [];
  }
};

/**
 * Create a new care plan for a resident.
 */
export const createCarePlan = async (residentId: string, carePlanData: any) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/careplan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carePlanData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error creating care plan: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating care plan:", error);
    return null;
  }
};

/**
 * Update an existing care plan for a resident.
 */
export const updateCarePlan = async (residentId: string, carePlanData: any) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/careplan/${carePlanData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carePlanData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error updating care plan: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating care plan:", error);
    return null;
  }
};
