"use client";

import { getReports } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportResponse, ReportStatus } from "@/types/report";
import { Role, User } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getReportBadgeConfig from "../../_components/badge-config";

export default function ReviewReports() {
  const router = useRouter();
  const [resolvedReports, setResolvedReports] = useState<ReportResponse[]>([]);
  const [reviewedReports, setReviewedReports] = useState<ReportResponse[]>([]);
  const [submittedReports, setSubmittedReports] = useState<ReportResponse[]>(
    [],
  );
  const [user, setUser] = useState<User>();

  useEffect(() => {
    fetchUser();
    fetchReports();
  }, []);

  const handleView = (report: ReportResponse) => {
    router.push(`/dashboard/incidents/view?reportId=${report.id}`);
  };

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
      const resolved = await getReports(ReportStatus.CHANGES_MADE);
      const reviewed = await getReports(ReportStatus.CHANGES_REQUESTED);
      const submitted = await getReports(ReportStatus.SUBMITTED);
      setSubmittedReports(submitted);
      setReviewedReports(reviewed);
      setResolvedReports(resolved);
    } catch (error) {
      console.error("Failed to fetch reports");
    }
  };

  return (
    <div className="p-8">
      <div className="pb-4">
        <h1 className="text-2xl font-semibold tracking-tight pb-2">
          Review Submitted Reports
        </h1>
        <p className="text-sm text-muted-foreground pb-1">
          Approve or request changes from submitted reports
        </p>
      </div>

      <hr className="border-t-1 border-gray-300 pb-8" />

      <div className="flex flex-col gap-8">
        <div className="rounded-md border px-4 bg-blue-50">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-md font-medium">
                Pending Review From Admin {`[${submittedReports.length}]`}
              </AccordionTrigger>
              <AccordionContent className="rounded border mt-2 mb-4 pb-0">
                <Table className="text-center bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">
                        Submitted Date
                      </TableHead>
                      <TableHead className="text-center">Form</TableHead>
                      <TableHead className="text-center">Reporter</TableHead>
                      <TableHead className="text-center">Resident</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submittedReports.length === 0 ? (
                      <TableRow className="mb-0">
                        <TableCell colSpan={7} className="h-10 text-center">
                          No reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      submittedReports.map((report) => (
                        <TableRow
                          key={report.id}
                          onClick={() => handleView(report)}
                        >
                          <TableCell className="font-medium">
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{report.form_name}</TableCell>

                          <TableCell>{report.reporter.name}</TableCell>

                          {report.primary_resident?.name ? (
                            <TableCell>
                              {report.primary_resident?.name}
                            </TableCell>
                          ) : (
                            <TableCell className="text-gray-400">NA</TableCell>
                          )}

                          <TableCell>
                            <Badge
                              className={getReportBadgeConfig(report.status)}
                            >
                              {report.status}
                            </Badge>
                          </TableCell>

                          {(report.status !== "Published" ||
                            user?.role === Role.ADMIN) && (
                            <TableCell className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="focus:ring-0 focus:ring-offset-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {/* {report.status !== "Published" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(report);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )} */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="rounded-md border px-4 bg-purple-50">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-md font-medium">
                Pending Approval From Admin {`[${resolvedReports.length}]`}
              </AccordionTrigger>
              <AccordionContent className="rounded border mt-2 mb-4 pb-0">
                <Table className="text-center bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">
                        Resolved Date
                      </TableHead>
                      <TableHead className="text-center">Form</TableHead>
                      <TableHead className="text-center">Reporter</TableHead>
                      <TableHead className="text-center">Resident</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resolvedReports.length === 0 ? (
                      <TableRow className="mb-0">
                        <TableCell colSpan={7} className="h-10 text-center">
                          No reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      resolvedReports.map((report) => (
                        <TableRow
                          key={report.id}
                          onClick={() => handleView(report)}
                        >
                          <TableCell className="font-medium">
                            {new Date(
                              report.reviews![report.reviews!.length - 1]
                                .reviewed_at,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{report.form_name}</TableCell>

                          <TableCell>{report.reporter.name}</TableCell>

                          {report.primary_resident?.name ? (
                            <TableCell>
                              {report.primary_resident?.name}
                            </TableCell>
                          ) : (
                            <TableCell className="text-gray-400">NA</TableCell>
                          )}

                          <TableCell>
                            <Badge
                              className={getReportBadgeConfig(report.status)}
                            >
                              {report.status}
                            </Badge>
                          </TableCell>

                          {(report.status !== "Published" ||
                            user?.role === Role.ADMIN) && (
                            <TableCell className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="focus:ring-0 focus:ring-offset-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end"></DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="rounded-md border px-4 bg-red-50">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-md font-medium">
                Pending Updates From Reporter {`[${reviewedReports.length}]`}
              </AccordionTrigger>
              <AccordionContent className="rounded border mt-2 mb-4 pb-0">
                <Table className="text-center bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">
                        Reviewed Date
                      </TableHead>
                      <TableHead className="text-center">Form</TableHead>
                      <TableHead className="text-center">Reporter</TableHead>
                      <TableHead className="text-center">Resident</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewedReports.length === 0 ? (
                      <TableRow className="mb-0">
                        <TableCell colSpan={7} className="h-10 text-center">
                          No reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reviewedReports.map((report) => (
                        <TableRow
                          key={report.id}
                          onClick={() => handleView(report)}
                        >
                          <TableCell className="font-medium">
                            {new Date(
                              report.reviews![report.reviews!.length - 1]
                                .reviewed_at,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{report.form_name}</TableCell>

                          <TableCell>{report.reporter.name}</TableCell>

                          {report.primary_resident?.name ? (
                            <TableCell>
                              {report.primary_resident?.name}
                            </TableCell>
                          ) : (
                            <TableCell className="text-gray-400">NA</TableCell>
                          )}

                          <TableCell>
                            <Badge
                              className={getReportBadgeConfig(report.status)}
                            >
                              {report.status}
                            </Badge>
                          </TableCell>

                          {(report.status !== "Published" ||
                            user?.role === Role.ADMIN) && (
                            <TableCell className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="focus:ring-0 focus:ring-offset-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end"></DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
