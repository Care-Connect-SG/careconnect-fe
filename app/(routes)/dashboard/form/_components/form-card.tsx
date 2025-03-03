"use client"

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookPlus, FilePenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormCardProps {
  id: string;
  title: string;
  description: string;
  created_date: string;
  status: string;
  onPublish: (formId: string) => void;
  onDelete: (formId: string) => void;
}

export default function FormCard({
  id,
  title,
  description,
  created_date,
  status,
  onPublish,
  onDelete,
}: FormCardProps) {
  const router = useRouter();

  return (
    <Card
      className={`w-xs max-w-xs h-[11rem] overflow-hidden ${
        status == "Published"
          ? "border-l-4 border-l-green-500"
          : "border-l-4 border-l-yellow-500"
      }`}
    >
      <Link href={`/dashboard/form/view/${id}`}>
        <CardHeader
          className={`flex flex-row items-start justify-between space-y-0`}
        >
          <div>
            <CardTitle className="text-base font-bold">{title}</CardTitle>
            <p className="hidden sm:block text-xs text-muted-foreground mt-1">
              Created at {created_date}
            </p>
          </div>
          <Badge
            className={
              status === "Published"
                ? "hidden md:block bg-green-100 text-green-800"
                : "hidden md:block bg-yellow-100 text-yellow-800"
            }
          >
            {status}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="hidden md:block text-xs truncate">{description}</p>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-end gap-4 py-2 px-6 text-semibold text-gray-400">
        {status === "Draft" && (
          <div className="flex gap-4 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`form/build?id=${id}`);
                    }}
                  >
                    <FilePenLine className="h-4 w-4 hover:text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(id);
                    }}
                  >
                    <BookPlus className="h-4 w-4 hover:text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Publish</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="w-[1.5px] h-5 bg-gray-300"></div>
          </div>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="h-4 w-4 hover:text-gray-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
