import { WellnessReportRecord } from "@/types/wellness-report";

export async function getWellnessReportsForResident(residentId: string): Promise<WellnessReportRecord[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch wellness reports: ${errorText}`);
    }

    const data = await response.json();
    console.log('Wellness reports response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error in getWellnessReportsForResident:', error);
    throw error;
  }
}

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

export async function createWellnessReport(
  residentId: string,
  reportData: Omit<WellnessReportRecord, '_id' | 'resident_id'>
): Promise<WellnessReportRecord> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create wellness report: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createWellnessReport:', error);
    throw error;
  }
}

export async function updateWellnessReport(
  residentId: string,
  reportId: string,
  updateData: Partial<WellnessReportRecord>
): Promise<WellnessReportRecord> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update wellness report: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateWellnessReport:', error);
    throw error;
  }
}

export async function deleteWellnessReport(
  residentId: string,
  reportId: string
): Promise<void> {
  try {
    console.log('Deleting report with ID:', reportId);
    console.log('Resident ID:', residentId);
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`;
    console.log('Delete URL:', url);
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete response error:', errorText);
      throw new Error(`Failed to delete wellness report: ${errorText}`);
    }
  } catch (error) {
    console.error('Error in deleteWellnessReport:', error);
    throw error;
  }
}
