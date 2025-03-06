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
import { useState } from "react";

interface ReportsTableProps {
  reports: ReportResponse[];
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(
    null,
  );

  const handleView = (report: ReportResponse) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
    // In a real app, you would navigate to a view page or open a modal
    console.log("Viewing report:", report.id);
  };

  const handleEdit = (report: ReportResponse) => {
    setSelectedReport(report);
    setEditDialogOpen(true);
    // In a real app, you would navigate to an edit page or open a modal
    console.log("Editing report:", report.id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Form</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Resident</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>{report.form_name}</TableCell>
                <TableCell>{report.reporter_name}</TableCell>
                <TableCell>{report.primary_resident_name}</TableCell>
                <TableCell>{report.published_date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.status === "Published"
                        ? "default"
                        : report.status === "Draft"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {report.status}
                  </Badge>
                </TableCell>
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
