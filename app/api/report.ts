import { CaregiverTag, ReportCreate, ReportResponse, ResidentTag } from "@/types/report";

export const getReports = async (
  status?: string,
): Promise<ReportResponse[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports`;

    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching reports: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reports: ", error);
    throw error;
  }
};

export const createReport = async (reportData: ReportCreate): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify(reportData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error creating report: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const updateReport = async (
  reportId: string,
  reportData: ReportCreate,
): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify(reportData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error updating report: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
};

export const submitForm = async (reportId: string): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}/submit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error submitting report: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
};

export const getReportById = async (
  reportId: string,
): Promise<ReportResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching report: ${response.statusText}`);
      //TODO: Find a better way to handle errors
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching report: ", error);
    throw error;
    //TODO: Find a better way to handle errors
  }
};

export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error deleting report: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};


export const getResidentTags = async (
  search_key?: string,
): Promise<ResidentTag[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BE_API_URL}/tags/residents`;

    if (search_key) {
      url += `?search_key=${encodeURIComponent(search_key)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching residents for tagging: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching residents for tagging: ", error);
    throw error;
  }
};


export const getCaregiverTags = async (
  search_key?: string,
): Promise<CaregiverTag[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BE_API_URL}/tags/caregivers`;

    if (search_key) {
      url += `?search_key=${encodeURIComponent(search_key)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching caregivers for tagging: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching caregivers for tagging: ", error);
    throw error;
  }
};