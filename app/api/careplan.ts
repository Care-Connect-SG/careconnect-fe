import { CarePlanRecord } from "@/types/careplan";

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
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching care plans");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching care plans:", error);
    return [];
  }
};

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
      const errData = await response.json();
      throw Error(errData.detail || "Error creating care plan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating care plan:", error);
    return null;
  }
};

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
      const errData = await response.json();
      throw Error(errData.detail || "Error updating care plan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating care plan:", error);
    return null;
  }
};
