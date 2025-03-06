import { UserResponse } from "@/types/user";
import { User, UserEdit } from "@/types/user";
import { UserForm } from "../(routes)/dashboard/nurses/_components/create-user-dialog";

export const getCurrentUser = async (email: string): Promise<UserResponse> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BE_API_URL}/users`;

    if (email) {
      url += `?status=${encodeURIComponent(email)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching user: ", error);
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
      throw new Error("Failed to create user");
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
      console.error("Failed to fetch user role");
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
      console.error("Failed to fetch user by ID");
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
      throw new Error(`Error fetching users: ${response.statusText}`);
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
      throw new Error(`Error fetching nurses: ${response.statusText}`);
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
    const response = await fetch(
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
      throw new Error("Failed to update user");
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
      throw new Error(`Error deleting user: ${response.statusText}`);
    }

    console.log(`User with ID ${userId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
