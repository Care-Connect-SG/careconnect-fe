"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-5">
      <h1 className="text-4xl mb-5">Welcome, {session?.user?.email}</h1>
      <Button className="w-24" onClick={() => signOut({ callbackUrl: "/" })}>
        Logout
      </Button>
    </div>
  );
}
