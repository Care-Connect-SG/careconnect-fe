import { Task } from "@/types/task";

/**
 * Fetch all tasks for a user based on their email.
 * This calls the backend endpoint GET /tasks?assigned_to=<email>
 */
export const getTasks = async (email: string): Promise<Task[]> => {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BE_API_URL
      }/tasks?assigned_to=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching tasks: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getTasks error:", error);
    throw error;
  }
};

/**
 * Fetch a single task by its ID.
 * This calls the backend endpoint GET /tasks/<task_id>
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
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
