import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Activity, ActivityCreate } from "@/types/activity";

export async function fetchActivities(): Promise<Activity[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Could not parse error response" }));
      throw Error(errorData.detail || "Failed to fetch activities");
    }

    return await response.json();
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Could not connect to the server. Please check your connection or try again later."
      );
    }
    throw error;
  }
}

export async function fetchUpcomingReminders(
  minutesThreshold: number = 15
): Promise<Activity[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities/reminders/upcoming?minutes_threshold=${minutesThreshold}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Could not parse error response" }));
      throw Error(errorData.detail || "Failed to fetch upcoming reminders");
    }

    return await response.json();
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Could not connect to the server. Please check your connection or try again later."
      );
    }
    throw error;
  }
}

export async function createActivity(
  data: Partial<ActivityCreate>
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
      // Handle the reminder_minutes field
      reminder_minutes:
        data.reminder_minutes === undefined ? null : data.reminder_minutes,
    };

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.detail || "Failed to create activity");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityCreate>
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
      // Handle the reminder_minutes field
      reminder_minutes:
        data.reminder_minutes === undefined ? null : data.reminder_minutes,
    };

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/activities/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.detail || "Failed to update activity");
    }

    return await response.json();
  } catch (error) {
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
      }
    );

    if (!response.ok) {
      let errorDetail = "Failed to delete activity";

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } else {
          await response.text();
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
      }

      throw new Error(errorDetail);
    }
  } catch (error) {
    throw error;
  }
}
