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
import { Role, User } from "@/types/user";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";


interface ReportsTableProps {
  user: User;
  reports: ReportResponse[];
  activeTab: string;
  handleDelete: (reportId: string) => void;
}

export default function ReportsTable({
  user,
  reports,
  activeTab,
  handleDelete
}: ReportsTableProps) {
  const router = useRouter();

  const handleView = (report: ReportResponse) => {
    router.push(`/dashboard/incidents/view?reportId=${report.id}`);
  };

  const handleEdit = (report: ReportResponse) => {
    router.push(
      `/dashboard/incidents/fill?formId=${report.form_id}&reportId=${report.id}`,
    );
  };

  return (
    <div className="rounded-md border">
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Created Date</TableHead>
            <TableHead className="text-center">Form</TableHead>
            {activeTab === "all" && (
              <TableHead className="text-center">Reporter</TableHead>
            )}
            <TableHead className="text-center">Resident</TableHead>
            {activeTab === "my" && (
              <TableHead className="text-center">Status</TableHead>
            )}
            {
              (user?.role === Role.ADMIN || activeTab === "my") && <TableHead className="text-center">Actions</TableHead>
            }
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
              <TableRow key={report.id} onClick={() => handleView(report)}>
                <TableCell className="font-medium">
                  {new Date(report.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{report.form_name}</TableCell>
                {activeTab == "all" && (
                  <TableCell>{report.reporter.name}</TableCell>
                )}
                <TableCell>{report.primary_resident?.name}</TableCell>
                {activeTab == "my" && (
                  <TableCell>
                    <Badge
                      className={
                        report.status === "Draft"
                          ? "text-yellow-800 bg-yellow-100 h-6"
                          : "text-green-800 bg-green-100 h-6"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                )}
                {
                  (report.status !== "Published" || user?.role === Role.ADMIN) && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="focus:ring-0 focus:ring-offset-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {
                            report.status !== "Published" && (
                              <DropdownMenuItem onClick={() => handleEdit(report)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )
                          }
                          {(user?.role === Role.ADMIN) && (
                            <DropdownMenuItem onClick={() => handleDelete(report.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )
                }
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
