import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { User, UserEdit } from "@/types/user";
import { UserForm } from "../(routes)/dashboard/nurses/_components/create-user-dialog";

export const getCurrentUser = async (): Promise<User> => {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/me`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.detail || "Failed to fetch current user details",
      );
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching current user details:", error);
    throw error;
  }
};

export const createUser = async (user: UserForm): Promise<User> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create user");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUser = async (email: string | undefined) => {
  if (!email) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/email/${email}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData.detail || "Failed to fetch user role");
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData.detail || "Failed to fetch user by ID");
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error fetching users`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getAllNurses = async (): Promise<User[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/?role=nurse`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error fetching nurses`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nurses:", error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  data: UserEdit,
): Promise<User> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update user");
    }

    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/${userId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error deleting user`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
