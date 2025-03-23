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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to create task");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
};

export const getTasks = async (filters?: {
  search?: string;
  status?: string;
  priority?: string;
  // Format: YYYY-MM-DD
  date?: string;
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to fetch tasks");
    }

    const data = await response.json();
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
    console.error("Error fetching tasks", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to fetch task by ID");
    }

    const task = await response.json();
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
    console.error("Error fetching task by ID", error);
    throw error;
  }
};

export const mutateTask = async (taskId: string) => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/handle-self`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to mutate task");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error mutating task:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to update task");
    }

    const data = await response.json();
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
    console.error("Error updating task:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to complete task");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error completing task:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to reopen task");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reopening task:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to duplicate task");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error duplicating task:", error);
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
      const errData = await response.json();
      throw Error(errData.detail || "Failed to download task");
    }

    return await response.blob();
  } catch (error) {
    console.error("Error downloading task:", error);
    throw error;
  }
};

export const requestReassignment = async (
  taskId: string,
  targetNurseId: string,
): Promise<void> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/request-reassignment?target_nurse_id=${targetNurseId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to request reassignment");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error requesting reassignment:", error);
    throw error;
  }
};

export const acceptReassignment = async (taskId: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/accept-reassignment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to accept reassignment");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error accepting reassignment:", error);
    throw error;
  }
};

export const rejectReassignment = async (
  reason: string,
  taskId: string,
): Promise<void> => {
  try {
    const response = await fetchWithAuth(
      `${
        process.env.NEXT_PUBLIC_BE_API_URL
      }/tasks/${taskId}/reject-reassignment?rejection_reason=${encodeURIComponent(
        reason,
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to reject reassignment");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error rejecting reassignment:", error);
    throw error;
  }
};
