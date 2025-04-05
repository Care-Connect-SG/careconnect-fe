import { getSession, signIn } from "next-auth/react";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  try {
    const session = await getSession();

    if (!session) {
      // If no session, redirect to sign in
      signIn();
      return new Promise(() => {}); // Return a never-resolving promise since we're redirecting
    }

    if (!session.accessToken) {
      // Perform the fetch without auth if there's no token
      return fetch(url, options);
    }

    // Clone the options to avoid mutating the original
    const authOptions = { ...options };

    // Merge headers
    authOptions.headers = {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    };

    try {
      // Perform the fetch with authentication
      const response = await fetch(url, authOptions);
      return response;
    } catch (error) {
      throw new Error(
        `Network error: Failed to connect to the server. Please check your connection and try again.`,
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown error occurred while making the request");
    }
  }
}
