"use client";

import { useSession } from "next-auth/react";
import QuickActions from "./_components/quick-actions";
import RecentIncidents from "./_components/recent-incidents";
import StaffWorkload from "./_components/staff-workload";
import StatsOverview from "./_components/stats-overview";
import TaskStats from "./_components/task-stats";
import UpcomingEvents from "./_components/upcoming-events";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-full gap-8 p-8">
        <p className="text-2xl font-semibold text-gray-800">
          Hello, {session?.user?.email}!
        </p>
        <Separator />

      <QuickActions />
      <p className="text-lg font-semibold text-gray-800">Overview</p>
      <StatsOverview />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StaffWorkload />
        <RecentIncidents />
      </div>

      <UpcomingEvents />
    </div>
  );
}
