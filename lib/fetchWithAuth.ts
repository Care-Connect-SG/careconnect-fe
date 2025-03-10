import { getSession, signIn } from "next-auth/react";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  console.log("fetchWithAuth - Starting request to:", url);
  const session = await getSession();
  if (!session) {
    console.log("fetchWithAuth - No session found, redirecting to sign in");
    signIn();
    return new Promise(() => {});
  }

  console.log("fetchWithAuth - Session found:", {
    hasAccessToken: !!session.accessToken,
    user: session.user,
  });

  const token = session.accessToken;
  if (!token) {
    console.error("fetchWithAuth - No access token in session");
    throw new Error("No valid access token found in session");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  console.log("fetchWithAuth - Making request with headers:", {
    url,
    method: options.method,
    headers: Object.fromEntries(headers.entries()),
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      mode: "cors",
    });
    console.log("fetchWithAuth - Response received:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });
    return response;
  } catch (error) {
    console.error("fetchWithAuth - Fetch error:", error);
    throw error;
  }
};
