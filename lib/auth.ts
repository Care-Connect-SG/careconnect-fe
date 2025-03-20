import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 30 minutes
const TOKENEXPIRY = 30 * 60 * 1000;

async function refreshAccessToken(token: any) {
  if (!token.refreshToken) {
    console.error("No refresh token available");
    return {
      ...token,
      error: "NoRefreshToken",
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: token.refreshToken }),
        credentials: "include",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      console.error("Token refresh failed:", error);
      return {
        ...token,
        error: error.detail || "RefreshAccessTokenError",
      };
    }

    const refreshedTokens = await res.json();
    console.log("Token refresh successful:", refreshedTokens);

    if (!refreshedTokens.access_token || !refreshedTokens.refresh_token) {
      console.error("Invalid token refresh response:", refreshedTokens);
      return {
        ...token,
        error: "InvalidTokenResponse",
      };
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
      accessTokenExpires: Date.now() + TOKENEXPIRY,
      id: refreshedTokens.id || token.id,
      role: refreshedTokens.role || token.role,
      email: refreshedTokens.email || token.email,
      name: refreshedTokens.name || token.name,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BE_API_URL}/users/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                username: credentials?.email || "",
                password: credentials?.password || "",
              }),
            },
          );

          if (!res.ok) {
            const error = await res.json();
            console.error("Login failed:", error);
            return null;
          }

          const user = await res.json();
          console.log("Login successful:", user);

          if (user && user.email) {
            if (!user.refresh_token) {
              console.error("Login response missing refresh_token:", user);
            }
            return {
              ...user,
              id: user.id,
              role: user.role,
              name: user.name,
              email: user.email,
              access_token: user.access_token,
              refresh_token: user.refresh_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Error during login:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          accessTokenExpires: Date.now() + TOKENEXPIRY,
          email: user.email,
          id: user.id,
          role: user.role,
          name: user.name,
          error: undefined,
        };
      }
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user = {
        ...session.user,
        email: token.email,
        id: token.id,
        role: token.role,
        name: token.name,
      };
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
