"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface FormCardPublishedProps {
  id: string;
  title: string;
  description: string;
  created_date: string;
}

export default function FormCardPublished({
  id,
  title,
  description,
  created_date,
}: FormCardPublishedProps) {
  const router = useRouter();

  const formatDate = (isoDate?: string): string => {
    if (!isoDate) return "Unknown Date"; // Handle null/undefined values

    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date formats

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="relative w-md max-w-md h-[14rem] overflow-hidden border-l-4 border-l-blue-500">
      <CardHeader
        className={`flex flex-row items-start justify-between space-y-0`}
      >
        <div>
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          <p className="hidden sm:block text-xs text-muted-foreground mt-1">
            Created at {formatDate(created_date)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="hidden md:block text-xs truncate">{description}</p>
      </CardContent>
      <CardFooter className="absolute w-full bottom-0">
        <Button
          variant="outline"
          onClick={() =>
            router.replace(`/dashboard/incidents/fill?formId=${id}`)
          }
          className="w-full"
        >
          Fill Form
        </Button>
      </CardFooter>
    </Card>
  );
}
