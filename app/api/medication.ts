import { MedicationRecord } from "@/types/medication";

/**
 * Fetch medication records for a specific resident.
 */
export const getMedicationsForResident = async (residentId: string): Promise<MedicationRecord[]> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BE_API_URL}/residents/${residentId}/medications`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching medications: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching medications:", error);
        return [];
    }
};
