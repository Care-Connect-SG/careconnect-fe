import { Task } from "@/types/task";
import { getSession } from "next-auth/react";

export const getTasks = async (): Promise<Task[]> => {
  const session = await getSession();

  if (!session) {
    throw new Error("No active session found");
  }

  const token = session.accessToken as string;
  console.log(token);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getTaskById error:", error);
    throw error;
  }
};

export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/complete`,
      {
        method: "POST",
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
    console.error("completeTask error:", error);
    throw error;
  }
};
