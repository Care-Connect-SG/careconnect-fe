export const fetchMedicationByBarcode = async (barcode: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/fixedmedications/${barcode}`,
    );

    if (!response.ok) throw new Error("Medication not found");

    return await response.json();
  } catch (error) {
    console.error("Error fetching medication:", error);
    return null;
  }
};
