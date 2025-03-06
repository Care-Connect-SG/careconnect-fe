"use client"

import { getFormById } from "@/app/api/form";
import { getReportById } from "@/app/api/report";
import { FormResponse } from "@/types/form";
import { ReportResponse } from "@/types/report";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "../_components/loading-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ViewReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reportId = searchParams.get("reportId");

    const [report, setReport] = useState<ReportResponse>();
    const [form, setForm] = useState<FormResponse>();

    const fetchReport = async () => {
        try {
            const data: ReportResponse = await getReportById(reportId!);
            setReport(data);
            fetchForm(data.form_id);
        } catch {
            console.error("Report not found");
            router.replace("/404");
            return null;
        }
    };

    const fetchForm = async (formId: string) => {
        try {
            const data = await getFormById(formId!);
            setForm(data);
        } catch (error) {
            console.error("Failed to fetch form");
            return null;
        }
    };

    useEffect(() => {
        if (reportId) {
            fetchReport();
        }
    }, [reportId])


    if (!reportId) return <LoadingSkeleton />;


    return (
        <div className="py-4 px-8">
            <Link href="/dashboard/incidents">
                <button className="border h-10 w-10 rounded-md hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4 mx-auto" />
                </button>
            </Link>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="pb-2">Form Title {form?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <Badge
                            className={
                                report?.status === "Draft"
                                    ? "text-yellow-800 bg-yellow-100 h-6 px-4"
                                    : "text-green-800 bg-green-100 h-6"
                            }
                        >
                            {report?.status}
                        </Badge>
                        {
                            report?.published_date &&
                            <p className="text-sm mt-2 mb-4">Published At: {report?.published_date}</p>
                        }
                        <div className="my-4">
                            <h1 className="font-bold">Involved Personnel</h1>
                            <div className="text-sm">
                                <p>
                                    <span className="font-semibold text-gray-500">Reporter: </span>
                                    {report?.reporter.name}
                                </p>
                                {
                                    report?.primary_resident &&
                                    <div>
                                        <p><span className="font-semibold text-gray-500">Primary Resident: </span>
                                            {report?.primary_resident?.name}</p>
                                    </div>
                                }
                                {
                                    report?.involved_residents &&
                                    <div>
                                        <p><span className="font-semibold text-gray-500">Involved Residents: </span>
                                            {report.involved_residents.toString()}
                                        </p>
                                    </div>

                                }
                                {
                                    report?.involved_caregivers &&
                                    <div>
                                        <p><span className="font-semibold text-gray-500">Involved Caregivers: </span>
                                            {report.involved_caregivers.toString()}
                                        </p>
                                    </div>
                                }
                            </div>
                        </div>
                        <hr className="border-t-1 border-gray-300 py-2"></hr>
                        <div>
                            {
                                report?.report_content.map((section) => (
                                    <div key={section.form_element_id} className="my-2">
                                        <div className="font-bold">
                                            {form?.json_content
                                                .find((element) => (element.element_id === section.form_element_id))
                                                ?.label}
                                        </div>
                                        <div className="text-sm">
                                            {section.input}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}