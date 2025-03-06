"use client";

import { Suspense } from "react";
import { LoadingSkeleton } from "../_components/loading-skeleton";

export default function createReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
}
