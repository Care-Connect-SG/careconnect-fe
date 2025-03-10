import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Task } from "@/types/task";
import { TaskForm } from "../(routes)/dashboard/tasks/_components/task-form";

export const createTask = async (taskData: TaskForm): Promise<Task[]> => {
  try {
    console.log("Attempting to create task with data:", taskData);
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
    console.log("Task created successfully:", data);
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
}): Promise<Task[]> => {
  try {
    console.log("getTasks - Starting request with filters:", filters);
    const queryParams = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : "";

    const url = `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${
      queryParams ? `?${queryParams}` : ""
    }`;
    console.log("getTasks - Requesting URL:", url);

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
    console.log("getTasks - Successfully fetched tasks:", {
      count: data.length,
      tasks: data,
    });
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
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) {
      throw new Error(`Error updating task: ${response.statusText}`);
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
