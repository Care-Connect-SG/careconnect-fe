import { FormBase, FormComplete } from "@/types/form";

export const getForms = async (): Promise<FormComplete[]> => {
  try {
    const response = await fetch(
      `${process.env.BE_API_URL}/incident/forms`,
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

export const createForm = async (formData: FormBase): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify(formData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error creating form: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
};

export const updateForm = async (
  formId: string,
  formData: FormBase,
): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify(formData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error updating form: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating form:", error);
    throw error;
  }
};

export const publishForm = async (formId: string): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}/publish`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error publishing form: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error publishing form:", error);
    throw error;
  }
};

export const getFormById = async (formId: string): Promise<FormComplete> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching form: ${response.statusText}`);
      //TODO: Find a better way to handle errors
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching form: ", error);
    throw error;
    //TODO: Find a better way to handle errors
  }
};

export const deleteForm = async (formId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error deleting form: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
};
