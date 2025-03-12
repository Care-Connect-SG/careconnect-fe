"use client";

import { getForms } from "@/app/api/form";
import { getReports } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormResponse } from "@/types/form";
import { ReportResponse, ReportStatus } from "@/types/report";
import { UserResponse } from "@/types/user";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import ReportsTable from "./_components/reports-table";

interface FilterOptions {
  formId: string;
  reporterId: string;
  residentId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export default function IncidentReports() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    formId: "",
    reporterId: "",
    residentId: "",
    startDate: null,
    endDate: null,
  });
  const [user, setUser] = useState<UserResponse>();

  useEffect(() => {
    async function fetchUserId() {
      if (session?.user?.email) {
        try {
          const user = await getCurrentUser(session.user.email);
          setUser(user);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    }
    fetchUserId();
  }, [session]);

  useEffect(() => {
    fetchReports();
    fetchForms();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports");
    }
  };

  const fetchForms = async () => {
    try {
      const data = await getForms("Published");
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms");
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (activeTab === "my" && report.reporter.id != user?.id) return false;
      if (activeTab !== "my" && report.status != ReportStatus.PUBLISHED)
        return false;

      if (
        filterOptions.formId &&
        filterOptions.formId !== "all" &&
        report.form_id !== filterOptions.formId
      )
        return false;

      if (
        filterOptions.reporterId &&
        filterOptions.reporterId !== "all" &&
        report.reporter.id !== filterOptions.reporterId
      )
        return false;

      if (
        filterOptions.residentId &&
        filterOptions.residentId !== "all" &&
        report.primary_resident?.id !== filterOptions.residentId
      )
        return false;

      if (
        filterOptions.startDate &&
        new Date(report.created_at!) < filterOptions.startDate
      )
        return false;

      if (
        filterOptions.endDate &&
        new Date(report.created_at!) > filterOptions.endDate
      )
        return false;

      return true;
    });
  }, [activeTab, filterOptions, reports, user]);

  return (
    <>
      <div className="px-6 py-4">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight py-2">
          Incident Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          View all incident reports
        </p>
      </div>
      <hr className="border-t-1 border-gray-300 mx-6 pt-2 pb-0"></hr>
      <div className="px-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="my">My Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <ReportsTable reports={filteredReports} activeTab="all" />
          </TabsContent>
          <TabsContent value="my" className="mt-4">
            <ReportsTable reports={filteredReports} activeTab="my" />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
