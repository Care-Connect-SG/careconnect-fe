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
      console.error("Server response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Error creating task: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`,
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("createTask error:", error);
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
  date?: string;  // Format: YYYY-MM-DD
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("getTasks - Response not OK:", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Error fetching tasks: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("getTasks error:", error);
    throw error;
  }
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetchWithAuth(
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getTaskById error:", error);
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
      console.error("Update task error response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Error updating task: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`,
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("updateTask error:", error);
    throw error;
  }
};

export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/complete`,
      {
        method: "PATCH",
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
    console.error("completeTask error:", error);
    throw error;
  }
};

export const reopenTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/reopen`,
      {
        method: "PATCH",
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
    console.error("uncompleteTask error:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Error deleting task: ${response.statusText}`);
    }
  } catch (error) {
    console.error("deleteTask error:", error);
    throw error;
  }
};

export const duplicateTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetchWithAuth(
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
    console.error("duplicateTask error:", error);
    throw error;
  }
};

export const downloadTask = async (taskId: string): Promise<Blob> => {
  try {
    const response = await fetchWithAuth(
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

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("downloadTask error:", error);
    throw error;
  }
};
