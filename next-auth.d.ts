import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      email?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    access_token?: string;
    refresh_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    email?: string;
  }
}
