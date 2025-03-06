"use client";

import { Suspense } from "react";
import { FormLoadingSkeleton } from "./_components/form-skeleton";

export default function CreateFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<FormLoadingSkeleton />}>{children}</Suspense>;
}
