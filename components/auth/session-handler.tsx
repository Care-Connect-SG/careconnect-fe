"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SessionErrorHandlerProps {
  children: React.ReactNode;
}

export function SessionErrorHandler({ children }: SessionErrorHandlerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.error) {
      if (
        session.error === "RefreshTokenExpired" ||
        session.error === "RefreshAccessTokenError" ||
        session.error === "NoRefreshToken"
      ) {
        signOut({
          callbackUrl: "/auth/login",
          redirect: true,
        });
      }
    }
  }, [session, router]);

  return <>{children}</>;
}

export default SessionErrorHandler;
