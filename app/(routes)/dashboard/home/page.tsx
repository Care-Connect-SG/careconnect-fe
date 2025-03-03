"use client";

import TaskStats from "./_components/task-stats";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <main className="flex-1 overflow-auto w-full">
        <div className="p-8">
          <TaskStats />
        </div>
      </main>
    </div>
  );
}
