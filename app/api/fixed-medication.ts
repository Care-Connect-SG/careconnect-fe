export const fetchMedicationByBarcode = async (barcode: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/fixedmedications/${barcode}`,
    );

    if (!response.ok) {
      const errData = await response.json();
      throw Error(errData.detail || "Error fetching medications by barcode");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching medication:", error);
    return null;
  }
};
