import { Suspense } from "react";
import { LoadingSkeleton } from "../_components/loading-skeleton";

export default function resolveReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
}
