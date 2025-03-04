import { getSession } from "next-auth/react";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const session = await getSession();
  if (!session) {
    throw new Error("No active session found");
  }

  const token = session.accessToken as string;
  const headers = new Headers(options.headers || {});

  headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { ...options, headers });
};
