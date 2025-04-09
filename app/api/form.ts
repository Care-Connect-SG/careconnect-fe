import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { FormCreate, FormResponse } from "@/types/form";

export const getForms = async (status?: string): Promise<FormResponse[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms`;

    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching forms");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forms: ", error);
    throw error;
  }
};

export const createForm = async (formData: FormCreate): Promise<string> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error creating form");
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
  formData: FormCreate,
): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error updating form");
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
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error publishing form");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error publishing form:", error);
    throw error;
  }
};

export const getFormById = async (formId: string): Promise<FormResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching form by ID");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching form by ID: ", error);
    throw error;
  }
};

export const tryGetFormById = async (
  formId: string,
): Promise<FormResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/forms/${formId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch {
    return null;
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
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error deleting form");
    }
  } catch (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
};
