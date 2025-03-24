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

export const deleteCarePlan = async (
  residentId: string,
  carePlanId: string,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/careplan/${carePlanId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error deleting care plans");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting care plan:", error);
    return { success: false };
  }
};

export const createCarePlanWithEmptyValues = async (residentId: string) => {
  const emptyCarePlan = {
    resident_id: residentId,
    created_date: new Date().toISOString().split("T")[0],
    medical_conditions: "",
    doctor_appointments: "",
    dietary_restrictions: "",
    daily_meal_plan: "",
    hydration: "",
    nutritional_supplements: "",
    bathing_assistance: false,
    dressing_assistance: false,
    required_assistance: "",
    hobbies_interests: "",
    social_interaction_plan: "",
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/careplan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emptyCarePlan),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(
        errData.detail || "Error creating care plan with empty values",
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating care plan:", error);
    return null;
  }
};
