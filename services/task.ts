import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const getAITaskSuggestion = async (residentId: string) => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/ai-suggestion/${residentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("AI Task Suggestion Response:", response);

    if (!response.ok) {
      const errData = await response.json();
      console.error("AI Task Suggestion Error:", errData);
      throw Error(errData.detail || "Error getting AI task suggestion");
    }

    const data = await response.json();
    console.log("AI Task Suggestion Data:", data);
    return data;
  } catch (error) {
    console.error("Error getting AI task suggestion:", error);
    throw error;
  }
};
