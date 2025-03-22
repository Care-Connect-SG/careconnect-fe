import { Activity, ActivityCreate } from "@/types/activity";
import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_BE_API_URL;

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

export async function fetchActivities(): Promise<Activity[]> {
  const response = await api.get(`/api/activities`);
  return response.data;
}

export async function createActivity(
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const response = await api.post(`/api/activities`, data);
  return response.data;
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const response = await api.put(`/api/activities/${id}`, data);
  return response.data;
}

export async function deleteActivity(id: string): Promise<void> {
  await api.delete(`/api/activities/${id}`);
}
