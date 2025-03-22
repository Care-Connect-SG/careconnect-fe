import { Metadata } from "next";
import { Calendar } from "./_components";

export const metadata: Metadata = {
  title: "Calendar | CareConnect",
  description: "Activity Management Calendar",
};

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
      </div>
      <Calendar />
    </div>
  );
}
