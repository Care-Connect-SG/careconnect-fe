"use client";

import { getForms } from "@/app/api/form";
import { deleteReport, getReports } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FormResponse } from "@/types/form";
import { ReportResponse, ReportStatus } from "@/types/report";
import { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import ReportsTable from "./_components/reports-table";
import IncidentReportFilters from "@/components/incident-reports-filter";

interface FilterOptions {
  formId: string;
  reporterId: string[]; // Now an array for multi-selection
  residentId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export default function IncidentReports() {
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    formId: "",
    reporterId: [], // Updated to be an array for multi-selection
    residentId: "",
    startDate: null,
    endDate: null,
  });
  const [user, setUser] = useState<User>();

  useEffect(() => {
    fetchUser();
    fetchReports();
    fetchForms();
  }, []);

  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      await fetchReports();
      toast({
        title: "Report deleted",
        description: "Your report has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete report");
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

  // Extract unique reporters from reports
  const uniqueReporters = useMemo(() => {
    const reportersSet = new Set<string>();
    reports.forEach((report) => {
      if (report.reporter && report.reporter.id) {
        reportersSet.add(
          JSON.stringify({ id: report.reporter.id, name: report.reporter.name })
        );
      }
    });

    return Array.from(reportersSet).map((item) => JSON.parse(item));
  }, [reports]);

  // Extract unique residents from reports
  const uniqueResidents = useMemo(() => {
    const residentsSet = new Set<string>();
    reports.forEach((report) => {
      if (report.primary_resident && report.primary_resident.id) {
        residentsSet.add(
          JSON.stringify({
            id: report.primary_resident.id,
            name: report.primary_resident.name,
          })
        );
      }
    });

    return Array.from(residentsSet).map((item) => JSON.parse(item));
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (activeTab === "my" && report.reporter.id !== user?.id) return false;
      if (activeTab !== "my" && report.status !== ReportStatus.PUBLISHED)
        return false;

      if (
        filterOptions.formId &&
        filterOptions.formId !== "all" &&
        report.form_id !== filterOptions.formId
      )
        return false;

      // ✅ Ensure BOTH filters work independently & together
      const matchesReporter =
        filterOptions.reporterId.length === 0 ||
        filterOptions.reporterId.includes(report.reporter.id);

      const matchesResident =
        filterOptions.residentId.length === 0 ||
        filterOptions.residentId === "all" ||
        (report.primary_resident?.id &&
          filterOptions.residentId.includes(report.primary_resident.id));

      if (!matchesReporter || !matchesResident) return false;

      // ✅ Apply Date Filters
      const reportDate = new Date(report.created_at!);

      if (
        filterOptions.startDate &&
        reportDate < new Date(filterOptions.startDate)
      ) {
        return false;
      }

      if (
        filterOptions.endDate &&
        reportDate > new Date(filterOptions.endDate)
      ) {
        return false;
      }

      return true;
    });
  }, [activeTab, filterOptions, reports, user]);

  return (
    <>
      <div className="px-6 py-4">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight py-2">
          Incident Reports
        </h1>
        <IncidentReportFilters
          uniqueReporters={uniqueReporters}
          uniqueResidents={uniqueResidents}
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />
      </div>
      <hr className="border-t-1 border-gray-300 mx-6 pt-2 pb-0"></hr>
      <div className="px-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="my">My Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <ReportsTable
              user={user!}
              reports={filteredReports}
              activeTab="all"
              handleDelete={handleDeleteReport}
            />
          </TabsContent>
          <TabsContent value="my" className="mt-4">
            <ReportsTable
              user={user!}
              reports={filteredReports}
              activeTab="my"
              handleDelete={handleDeleteReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
