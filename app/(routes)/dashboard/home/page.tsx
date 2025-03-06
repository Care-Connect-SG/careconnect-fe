"use client";

import { useSession } from "next-auth/react";
import QuickActions from "./_components/quick-actions";
import RecentIncidents from "./_components/recent-incidents";
import StaffWorkload from "./_components/staff-workload";
import StatsOverview from "./_components/stats-overview";
import TaskStats from "./_components/task-stats";
import UpcomingEvents from "./_components/upcoming-events";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-full gap-8 p-8">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-2xl font-semibold text-gray-800">
          Hello, {session?.user?.email}!
        </h1>
      </div>
      <QuickActions />
      <StatsOverview />
      <TaskStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StaffWorkload />
        <RecentIncidents />
      </div>
      <UpcomingEvents />
    </div>
  );
}
