import { WellnessReportRecord } from "@/types/wellnessReport";

const BASE_URL = process.env.NEXT_PUBLIC_BE_API_URL;

export const getWellnessReportsForResident = async (
    residentId: string
): Promise<WellnessReportRecord[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/residents/${residentId}/wellness-reports`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch wellness reports");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching wellness reports:", error);
        return [];
    }
};

export const getWellnessReportById = async (
    residentId: string,
    reportId: string
): Promise<WellnessReportRecord | null> => {
    try {
        const response = await fetch(
            `${BASE_URL}/residents/${residentId}/wellness-reports/${reportId}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch wellness report");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching wellness report:", error);
        return null;
    }
};

export const createWellnessReport = async (
    residentId: string,
    reportData: Partial<WellnessReportRecord>
): Promise<WellnessReportRecord | null> => {
    try {
        const response = await fetch(
            `${BASE_URL}/residents/${residentId}/wellness-reports`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reportData),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create wellness report");
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
    updatedData: Partial<WellnessReportRecord>
): Promise<WellnessReportRecord | null> => {
    try {
        const response = await fetch(
            `${BASE_URL}/residents/${residentId}/wellness-reports/${reportId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update wellness report");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating wellness report:", error);
        return null;
    }
};

export const deleteWellnessReport = async (
    residentId: string,
    reportId: string
): Promise<boolean> => {
    try {
        const response = await fetch(
            `${BASE_URL}/residents/${residentId}/wellness-reports/${reportId}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete wellness report");
        }

        return true;
    } catch (error) {
        console.error("Error deleting wellness report:", error);
        return false;
    }
};
