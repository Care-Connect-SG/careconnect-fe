import {
  CaregiverTag,
  ReportCreate,
  ReportResponse,
  ReportReviewCreate,
  ResidentTag,
} from "@/types/report";
import { User } from "@/types/user";


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

export const approveReport = async (
  reportId: string,
): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}/publish`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error publishing report");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error publishing report:", error);
    throw error;
  }
};

export const reviewReport = async (
  reportId: string,
  user: User,
  review: string,
): Promise<string> => {
  const reviewer: CaregiverTag = {
    id: user.id,
    name: user.name,
    role: user.role,
  }

  const reviewData: ReportReviewCreate = {
    review_id: reportId,
    reviewer: reviewer,
    review: review,
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}/review`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error adding review to report");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding review to` report:", error);
    throw error;
  }
};

export const resolveReportReview = async (
  reportId: string,
  resolution: string,
  reportData: ReportCreate,
): Promise<string> => {
  try {
    await updateReport(reportId, reportData);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/incident/reports/${reportId}/resolve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: resolution,
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error resolving report review");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error resolving report review:", error);
    throw error;
  }
};