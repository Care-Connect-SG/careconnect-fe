import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Activity, ActivityCreate } from "@/types/activity";

export async function fetchActivities(): Promise<Activity[]> {
  try {
    console.log("Attempting to fetch activities...");
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Could not parse error response" }));
      console.error("Error response from server:", errorData);
      throw Error(errorData.detail || "Failed to fetch activities");
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} activities`);
    return data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    // Handle different types of errors
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Could not connect to the server. Please check your connection or try again later.",
      );
    }
    throw error;
  }
}

export async function createActivity(
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  try {
    const apiData = {
      ...data,
      start_time: data.start_time
        ? new Date(data.start_time).toISOString().split(".")[0]
        : undefined,
      end_time: data.end_time
        ? new Date(data.end_time).toISOString().split(".")[0]
        : undefined,
    };

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.detail || "Failed to create activity");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  try {
    const apiData = {
      ...data,
      start_time: data.start_time
        ? new Date(data.start_time).toISOString().split(".")[0]
        : undefined,
      end_time: data.end_time
        ? new Date(data.end_time).toISOString().split(".")[0]
        : undefined,
    };

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.detail || "Failed to update activity");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
}

export async function deleteActivity(id: string): Promise<void> {
  if (!id) {
    throw new Error("Activity ID is required");
  }

  try {
    console.log(`Attempting to delete activity with ID: ${id}`);
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      let errorDetail = "Failed to delete activity";

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } else {
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      console.error(`Delete activity error (${response.status}):`, errorDetail);
      throw new Error(errorDetail);
    }

    console.log(`Successfully deleted activity with ID: ${id}`);
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}
