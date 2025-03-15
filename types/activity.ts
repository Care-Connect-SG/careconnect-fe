import axios from 'axios';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
  tags?: string;
  visibility?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
  tags?: string;
  visibility?: boolean;
}

export const PREDEFINED_CATEGORIES = ['Outing', 'Workshop', 'Other'] as const;
export const PREDEFINED_LOCATIONS = ['Online', 'Nursing Home Yard', 'Common Space', 'Other'] as const;

export interface ActivityFilter {
  start_date?: string;
  end_date?: string;
  category?: string;
  sort_by?: 'start_time' | 'title' | 'category';
  sort_order?: 'asc' | 'desc';
}

const API_URL = process.env.NEXT_PUBLIC_BE_API_URL;

export const activityService = {
  async create(data: ActivityCreate): Promise<Activity> {
    const response = await axios.post(`${API_URL}/api/v1/api/activities`, data);
    return response.data;
  },

  async list(filters?: ActivityFilter): Promise<Activity[]> {
    const response = await axios.get(`${API_URL}/api/v1/api/activities`, {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<Activity> {
    const response = await axios.get(`${API_URL}/api/v1/api/activities/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<ActivityCreate>): Promise<Activity> {
    const response = await axios.put(`${API_URL}/api/v1/api/activities/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/v1/api/activities/${id}`);
  },
}; 