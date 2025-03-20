import axios from "axios";
import { getSession } from "next-auth/react";

export interface Activity {
  _id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  category?: string;
  created_by?: string;
}

export interface ActivityCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  category?: string;
}

export const PREDEFINED_CATEGORIES = ["Outing", "Workshop", "Other"] as const;
export const PREDEFINED_LOCATIONS = [
  "Online",
  "Nursing Home Yard",
  "Common Space",
  "Other",
] as const;

export interface ActivityFilter {
  start_time?: string;
  end_time?: string;
  category?: string;
  tags?: string;
  search?: string;
  sort_by?: "start_time" | "title" | "category";
  sort_order?: "asc" | "desc";
}

const API_URL = process.env.NEXT_PUBLIC_BE_API_URL;

const getAuthHeaders = async () => {
  const session = await getSession();
  return {
    Authorization: session?.accessToken ? `Bearer ${session.accessToken}` : "",
  };
};

export const activityService = {
  async create(data: ActivityCreate): Promise<Activity> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/activities`, data, {
      headers,
    });
    return response.data;
  },

  async list(filters?: ActivityFilter): Promise<Activity[]> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/activities`, {
      headers,
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<Activity> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/activities/${id}`, {
      headers,
    });
    return response.data;
  },

  async update(id: string, data: Partial<ActivityCreate>): Promise<Activity> {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/api/activities/${id}`, data, {
      headers,
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/api/activities/${id}`, { headers });
  },
};
