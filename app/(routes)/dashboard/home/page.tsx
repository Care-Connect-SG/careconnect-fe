"use client";

import { useSession } from "next-auth/react";
import TaskStats from "./_components/task-stats";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-full gap-8 p-8">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-2xl font-semibold text-gray-800">
          Hello, {session?.user?.email}
        </h1>
        <TaskStats />
      </div>
    </div>
  );
}
