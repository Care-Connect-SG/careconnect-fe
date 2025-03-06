import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 30 minutes
const TOKENEXPIRY = 30 * 60 * 1000;

async function refreshAccessToken(token: any) {
  if (!token.refreshToken) {
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
      },
    );

    const refreshedTokens = await res.json();

    if (!res.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + TOKENEXPIRY,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_API_URL}/users/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: credentials?.email || "",
              password: credentials?.password || "",
            }),
          }
        );
        const user = await res.json();

        if (res.ok && user && user.email) {
          if (!user.refresh_token) {
            console.error("Login response missing refresh_token:", user);
          }
          return user;
        }
        console.error("Login failed:", res.status, user);
        return null;
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
      };
      return session;
    },
  },
};

export default NextAuth(authOptions);
