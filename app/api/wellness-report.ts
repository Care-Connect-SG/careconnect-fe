import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { WellnessReportRecord } from "@/types/wellness-report";

export const getWellnessReportsForResident = async (
  residentId: string,
): Promise<WellnessReportRecord[]> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching wellness reports");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wellness reports:", error);
    return [];
  }
};

export const getWellnessReportById = async (
  residentId: string,
  reportId: string,
): Promise<WellnessReportRecord | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching wellness report by ID");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wellness report:", error);
    return null;
  }
};

export const createWellnessReport = async (
  residentId: string,
  reportData: Partial<WellnessReportRecord>,
): Promise<WellnessReportRecord | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error creating wellness report");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating wellness report:", error);
    return null;
  }
};

export const updateWellnessReport = async (
  residentId: string,
  reportId: string,
  updatedData: Partial<WellnessReportRecord>,
): Promise<WellnessReportRecord | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error updating wellness report");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating wellness report:", error);
    return null;
  }
};

export const deleteWellnessReport = async (
  residentId: string,
  reportId: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error deleting wellness report");
    }

    return true;
  } catch (error) {
    console.error("Error deleting wellness report:", error);
    return false;
  }
};
