import {
  CaregiverTag,
  ReportCreate,
  ReportResponse,
  ResidentTag,
} from "@/types/report";

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
      },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching reports");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reports: ", error);
    throw error;
  }
};

export const createReport = async (
  reportData: ReportCreate,
): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error creating report");
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
        },
        body: JSON.stringify(reportData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error updating report");
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
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error submitting report");
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
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching report by ID");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching report by ID: ", error);
    throw error;
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
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error deleting report");
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
      },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching resident tags");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching resident tags: ", error);
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
      },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching caregiver tags");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching caregiver tags: ", error);
    throw error;
  }
};
