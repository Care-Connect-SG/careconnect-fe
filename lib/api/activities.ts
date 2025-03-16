import { Activity, ActivityCreate } from "@/types/activity";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BE_API_URL;

export async function fetchActivities(): Promise<Activity[]> {
  const response = await axios.get(`${API_URL}/api/activities`);
  return response.data;
}

export async function createActivity(
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const response = await axios.post(`${API_URL}/api/activities`, data);
  return response.data;
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityCreate>,
): Promise<Activity> {
  const response = await axios.put(`${API_URL}/api/activities/${id}`, data);
  return response.data;
}

export async function deleteActivity(id: string): Promise<void> {
  await axios.delete(`${API_URL}/api/activities/${id}`);
}
