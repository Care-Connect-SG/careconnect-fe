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
  return headers;
}

export async function fetchActivities(): Promise<Activity[]> {
  const response = await fetch(`${API_URL}/api/activities`, {
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }
  return response.json();
}

export async function createActivity(
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create activity");
  }
  return response.json();
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update activity");
  }
  return response.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: "DELETE",
    headers: await getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete activity");
  }
}
