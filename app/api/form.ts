import { FormComplete } from "@/types/form";

export const getForms = async (): Promise<FormComplete[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching forms: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forms: ", error);
    throw error;
  }
};
