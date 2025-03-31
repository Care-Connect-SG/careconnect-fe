import { WellnessReportRecord } from "@/types/wellness-report";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export async function getWellnessReportsForResident(residentId: string): Promise<WellnessReportRecord[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/`;
    const response = await fetchWithAuth(url);
    
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
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`,
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
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      }
    );

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
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

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
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/${reportId}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete wellness report: ${errorText}`);
    }
  } catch (error) {
    console.error('Error in deleteWellnessReport:', error);
    throw error;
  }
}

export async function generateAIWellnessReport(
  residentId: string
): Promise<WellnessReportRecord> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/wellness-reports/generate-ai`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate AI wellness report: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateAIWellnessReport:', error);
    throw error;
  }
}
