import { getSession, signIn } from "next-auth/react";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const session = await getSession();
  if (!session) {
    signIn();
    return new Promise(() => {});
  }

  const token = session.accessToken;
  if (!token) {
    throw new Error("No valid access token found in session");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { ...options, headers });
};
