"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import QuickActions from "./_components/quick-actions";
import RecentIncidents from "./_components/recent-incidents";
import StaffWorkload from "./_components/staff-workload";
import StatsOverview from "./_components/stats-overview";
import UpcomingEvents from "./_components/upcoming-events";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Quick Actions - Full Width */}
      <div className="w-full">
        <QuickActions />
      </div>

      {/* Stats Overview - Full Width */}
      <div className="w-full">
        <StatsOverview />
      </div>

      {/* Two Column Layout for Workload and Incidents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StaffWorkload />
        <RecentIncidents />
      </div>

      {/* Upcoming Events - Full Width */}
      <div className="w-full">
        <UpcomingEvents />
      </div>
    </div>
  );
}
