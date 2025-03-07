"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="px-8 py-4">
      <h1 className="text-2xl font-semibold tracking-tight py-2">
        <Skeleton className="h-6 w-48" />
      </h1>
      <Skeleton className="h-4 w-80 text-sm text-muted-foreground" />

      <div className="py-4">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      <div className="py-4 space-y-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
