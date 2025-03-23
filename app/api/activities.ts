import { Activity, ActivityCreate } from "@/types/activity";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_BE_API_URL;

async function getHeaders() {
  const session = await getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  if (session && (session.user as any)?.role) {
    headers["X-User-Role"] = (session.user as any).role;
  }
  return headers;
}

export async function fetchActivities(): Promise<Activity[]> {
  const response = await fetch(`${API_URL}/api/v1/activities`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }
  const activities = await response.json();
  
  // The backend response includes these fields:
  // - id: string
  // - title: string
  // - description: string
  // - start_time: string (ISO format)
  // - end_time: string (ISO format)
  // - location: string
  // - category: string
  // - created_at: string (ISO format)
  // - updated_at: string (ISO format)
  // - created_by: string (user ID who created the activity)
  
  return activities;
}

export async function createActivity(
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const apiData = {
    ...data,
    start_time: data.start_time 
      ? new Date(data.start_time).toISOString().split('.')[0] 
      : undefined,
    end_time: data.end_time 
      ? new Date(data.end_time).toISOString().split('.')[0] 
      : undefined,
  };

  const response = await fetch(`${API_URL}/api/v1/activities`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(apiData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create activity");
  }
  
  const activity = await response.json();
  return activity;
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const apiData = {
    ...data,
    start_time: data.start_time 
      ? new Date(data.start_time).toISOString().split('.')[0] 
      : undefined,
    end_time: data.end_time 
      ? new Date(data.end_time).toISOString().split('.')[0] 
      : undefined,
  };

  const response = await fetch(`${API_URL}/api/v1/activities/${id}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(apiData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update activity");
  }
  
  const activity = await response.json();
  return activity;
}

export async function deleteActivity(id: string): Promise<void> {
  if (!id) {
    throw new Error("Activity ID is required");
  }

  try {
    const headers = await getHeaders();
    
    const response = await fetch(`${API_URL}/api/v1/activities/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete activity (${response.status})`;
      try {
        const text = await response.text();
        const errorData = text ? JSON.parse(text) : null;
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch (parseError) {
        // Parsing error, use the default message
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw error;
  }
} 