"use client";

import { getForms } from "@/app/api/form";
import { deleteReport, getReports } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FormResponse } from "@/types/form";
import { ReportResponse, ReportStatus } from "@/types/report";
import { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import IncidentReportFilters from "./_components/incident-reports-filter";
import ReportsTable from "./_components/reports-table";

interface FilterOptions {
  search: string;
  reporterId: string[];
  residentId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export default function IncidentReports() {
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
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
      toast({
        title: "Error fetching user data",
        description: "Failed to load user information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
      toast({
        title: "Error fetching reports",
        description: "Failed to load reports data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      console.error("Failed to delete report", error);
      toast({
        title: "Error deleting report",
        description: "Failed to delete the report.",
        variant: "destructive",
      });
    }
  };

  const fetchForms = async () => {
    try {
      const data = await getForms("Published");
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms", error);
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
          }),
        );
      }
    });
    return Array.from(set).map((item) => JSON.parse(item));
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (activeTab === "my" && report.reporter.id !== user?.id) return false;
      if (activeTab !== "my" && report.status !== ReportStatus.PUBLISHED)
        return false;

      const searchTerm = filterOptions.search.toLowerCase().trim();
      const matchesSearch =
        searchTerm === "" ||
        report.form_name?.toLowerCase().includes(searchTerm);

      const matchesReporter =
        filterOptions.reporterId.length === 0 ||
        filterOptions.reporterId.includes(report.reporter.id);

      const matchesResident =
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
        matchesSearch &&
        matchesReporter &&
        matchesResident &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [activeTab, filterOptions, reports, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Incident Reports
        </h1>
        <IncidentReportFilters
          uniqueReporters={uniqueReporters}
          uniqueResidents={uniqueResidents}
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />
      </div>

      <div>
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
    </div>
  );
}
