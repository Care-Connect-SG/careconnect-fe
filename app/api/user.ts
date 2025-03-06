export interface UserResponse {
  id: string;
  name: string;
  role: string;
}

export const getAllNurses = async (): Promise<UserResponse[]> => {
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
