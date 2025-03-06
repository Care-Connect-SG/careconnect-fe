import { User } from "@/types/user";

export const getAllNurses = async (): Promise<User[]> => {
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
};

export const fetchUser = async (email: string | undefined) => {
  if (!email) return null; // Ensure email is provided

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

