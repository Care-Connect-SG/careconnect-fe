"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportResponse } from "@/types/report";
import { Edit, Eye, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReportsTableProps {
  reports: ReportResponse[];
  activeTab: string;
}

export default function ReportsTable({ reports, activeTab }: ReportsTableProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const router = useRouter();

  const handleView = (report: ReportResponse) => {
    router.push(`/dashboard/incidents/view?reportId=${report.id}`)
  };

  const handleEdit = (report: ReportResponse) => {
    router.push(`/dashboard/incidents/fill?formId=${report.form_id}&reportId=${report.id}`)
  };

  return (
    <div className="rounded-md border">
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Published Date</TableHead>
            <TableHead className="text-center">Form</TableHead>
            {activeTab === "all" && <TableHead className="text-center">Reporter</TableHead>}
            <TableHead className="text-center">Resident</TableHead>
            {activeTab === "my" && <TableHead className="text-center">Status</TableHead>}
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No reports found.
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.published_date || "-"}</TableCell>
                <TableCell>{report.form_name}</TableCell>
                {activeTab == "all" && <TableCell>{report.reporter.name}</TableCell>}
                <TableCell>{report.primary_resident?.name}</TableCell>
                {activeTab == "my" && <TableCell>
                  <Badge
                    className={
                      report.status === "Draft"
                        ? "text-yellow-800 bg-yellow-100 h-6"
                        : "text-green-800 bg-green-100 h-6"
                    }
                  >
                    {report.status}
                  </Badge>
                </TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(report)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {report.status !== "Published" && (
                        <DropdownMenuItem onClick={() => handleEdit(report)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
