import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Activity, ActivityCreate } from "@/types/activity";

export async function fetchActivities(): Promise<Activity[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.detail || "Failed to fetch activities");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
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
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.detail || "Failed to delete activity");
    }
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}
