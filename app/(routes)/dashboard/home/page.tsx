"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import QuickActions from "./_components/quick-actions";
import RecentIncidents from "./_components/recent-incidents";
import StaffWorkload from "./_components/staff-workload";
import StatsOverview from "./_components/stats-overview";
import UpcomingEvents from "./_components/upcoming-events";

const HomePage = () => {
  const { data: session } = useSession();
  const username = session?.user?.name;

  return (
    <div className="flex flex-col w-full gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-800 flex flex-row">
          Hi,{" "}
          {username ? (
            username
          ) : (
            <span>
              <Skeleton className="ml-2 w-24 h-8" />
            </span>
          )}
        </h1>
        <p className="text-gray-500">Welcome to your dashboard</p>
      </div>
      <div className="flex flex-col space-y-6">
        <QuickActions />
        <StatsOverview />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaffWorkload />
          <RecentIncidents />
        </div>
        <UpcomingEvents />
      </div>
    </div>
  );
};

export default HomePage;
