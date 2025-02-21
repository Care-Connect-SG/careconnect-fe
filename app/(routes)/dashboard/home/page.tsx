"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
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
    <div className="flex flex-col items-center justify-center bg-gray-100 p-5 w-full">
      <h1 className="text-2xl mb-2">Welcome, {session?.user?.email}</h1>
      <Button className="w-24" onClick={() => signOut({ callbackUrl: "/" })}>
        Logout
      </Button>
    </div>
  );
}
