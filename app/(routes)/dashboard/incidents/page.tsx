"use client";

import { getForms } from "@/app/api/form";
import { deleteReport, getReports } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import IncidentReportFilters from "./_components/incident-reports-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FormResponse } from "@/types/form";
import { ReportResponse, ReportStatus } from "@/types/report";
import { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import ReportsTable from "./_components/reports-table";

interface FilterOptions {
  formId: string;
  reporterId: string[];
  residentId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export default function IncidentReports() {
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    formId: "all",
    reporterId: [],
    residentId: "all",
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

  const uniqueReporters = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.reporter?.id) {
        set.add(JSON.stringify({ id: r.reporter.id, name: r.reporter.name }));
      }
    });
    return Array.from(set).map((item) => JSON.parse(item));
  }, [reports]);

  const uniqueResidents = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.primary_resident?.id) {
        set.add(
          JSON.stringify({
            id: r.primary_resident.id,
            name: r.primary_resident.name,
          })
        );
      }
    });
    return Array.from(set).map((item) => JSON.parse(item));
  }, [reports]);

  const uniqueForms = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.form_id && r.form_name) {
        set.add(JSON.stringify({ id: r.form_id, name: r.form_name }));
      }
    });
    return Array.from(set).map((item) => JSON.parse(item));
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (activeTab === "my" && report.reporter.id !== user?.id) return false;
      if (activeTab !== "my" && report.status !== ReportStatus.PUBLISHED)
        return false;

      const matchesForm =
        filterOptions.formId === "all" ||
        report.form_id === filterOptions.formId;

      const matchesReporter =
        filterOptions.reporterId.length === 0 ||
        filterOptions.reporterId.includes(report.reporter.id);

      const matchesResident =
        filterOptions.residentId.length === 0 ||
        filterOptions.residentId === "all" ||
        (report.primary_resident?.id &&
          filterOptions.residentId.includes(report.primary_resident.id));

      const reportDate = new Date(report.created_at!);

      const matchesStartDate =
        !filterOptions.startDate ||
        reportDate >= new Date(filterOptions.startDate);

      const matchesEndDate =
        !filterOptions.endDate || reportDate <= new Date(filterOptions.endDate);

      return (
        matchesForm &&
        matchesReporter &&
        matchesResident &&
        matchesStartDate &&
        matchesEndDate
      );
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
          uniqueForms={uniqueForms} // ✅ NEW
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />
      </div>
      <hr className="border-t-1 border-gray-300 mx-6 pt-2 pb-0" />
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
