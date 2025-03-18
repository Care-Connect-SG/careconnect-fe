import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Task, TaskUpdate } from "@/types/task";
import { TaskForm } from "../(routes)/dashboard/tasks/_components/task-form";

export const createTask = async (taskData: TaskForm): Promise<Task[]> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Error creating task: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
    throw error;
  }
};

export const getTasks = async (filters?: {
  search?: string;
  status?: string;
  priority?: string;
  date?: string; // Format: YYYY-MM-DD
}): Promise<Task[]> => {
  try {
    const queryParams = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : "";

    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${
      queryParams ? `?${queryParams}` : ""
    }`;

    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error fetching tasks: ${response.statusText}`);
    }

    const data = await response.json();
    // Convert UTC dates to local Date objects
    return data.map((task: any) => ({
      ...task,
      start_date: new Date(task.start_date),
      due_date: new Date(task.due_date),
      end_recurring_date: task.end_recurring_date
        ? new Date(task.end_recurring_date)
        : undefined,
      finished_at: task.finished_at ? new Date(task.finished_at) : undefined,
      created_at: new Date(task.created_at),
    }));
  } catch (error) {
    throw error;
  }
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching task by ID: ${response.statusText}`);
    }

    const task = await response.json();
    // Convert UTC dates to local Date objects
    return {
      ...task,
      start_date: new Date(task.start_date),
      due_date: new Date(task.due_date),
      end_recurring_date: task.end_recurring_date
        ? new Date(task.end_recurring_date)
        : undefined,
      finished_at: task.finished_at ? new Date(task.finished_at) : undefined,
      created_at: new Date(task.created_at),
    };
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (
  taskId: string,
  updatedData: Partial<TaskForm>,
): Promise<Task> => {
  try {
    const dataToSend: TaskUpdate = {};

    if (updatedData.task_title) dataToSend.task_title = updatedData.task_title;
    if (updatedData.task_details)
      dataToSend.task_details = updatedData.task_details;
    if (updatedData.media) dataToSend.media = updatedData.media;
    if (updatedData.notes) dataToSend.notes = updatedData.notes;
    if (updatedData.status) dataToSend.status = updatedData.status;
    if (updatedData.priority) dataToSend.priority = updatedData.priority;
    if (updatedData.category) dataToSend.category = updatedData.category;
    if (updatedData.residents)
      dataToSend.residents = updatedData.residents.map(String);
    if (updatedData.start_date)
      dataToSend.start_date = new Date(updatedData.start_date).toISOString();
    if (updatedData.due_date)
      dataToSend.due_date = new Date(updatedData.due_date).toISOString();
    if (updatedData.recurring) dataToSend.recurring = updatedData.recurring;
    if (updatedData.end_recurring_date)
      dataToSend.end_recurring_date = new Date(
        updatedData.end_recurring_date,
      ).toISOString();
    if (updatedData.remind_prior)
      dataToSend.remind_prior = updatedData.remind_prior;
    if (updatedData.is_ai_generated !== undefined)
      dataToSend.is_ai_generated = updatedData.is_ai_generated;
    if (updatedData.assigned_to)
      dataToSend.assigned_to = String(updatedData.assigned_to);
    if (updatedData.update_series !== undefined)
      dataToSend.update_series = updatedData.update_series;

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Error updating task: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`,
      );
    }

    const data = await response.json();
    // Convert UTC dates to local Date objects
    return {
      ...data,
      start_date: new Date(data.start_date),
      due_date: new Date(data.due_date),
      end_recurring_date: data.end_recurring_date
        ? new Date(data.end_recurring_date)
        : undefined,
      finished_at: data.finished_at ? new Date(data.finished_at) : undefined,
      created_at: new Date(data.created_at),
    };
  } catch (error) {
    throw error;
  }
};

export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/complete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error marking task as completed: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const reopenTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/reopen`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error marking task as incomplete: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (
  taskId: string,
  delete_series?: boolean,
): Promise<void> => {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}`,
    );
    if (delete_series) {
      url.searchParams.append("delete_series", "true");
    }

    const response = await fetchWithAuth(url.toString(), {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error deleting task: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

export const duplicateTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/duplicate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error duplicating task: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const downloadTask = async (taskId: string): Promise<Blob> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/download`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error downloading task: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    throw error;
  }
};
