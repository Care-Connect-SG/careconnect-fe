import { UserResponse } from "@/types/user";

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
        // Authorization: `Bearer ${process.env.BE_API_SECRET}`,
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