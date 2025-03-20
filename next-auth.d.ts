import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role: string;
      email: string;
      name: string;
    } & DefaultSession["user"];
  }

  interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    access_token: string;
    refresh_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
    email: string;
    id: string;
    role: string;
    name: string;
  }
}
