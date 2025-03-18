"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookPlus, Copy, FilePenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormCardProps {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
  onPublish: (formId: string) => void;
  onDelete: (formId: string) => void;
  onDuplicate: (formId: string) => void;
}

export default function FormCard({
  id,
  title,
  description,
  created_at,
  status,
  onPublish,
  onDelete,
  onDuplicate,
}: FormCardProps) {
  const router = useRouter();

  return (
    <Card
      className={`relative w-md max-w-md h-[11rem] overflow-hidden ${
        status === "Published"
          ? "border-l-4 border-l-green-500"
          : "border-l-4 border-l-yellow-500"
      }`}
    >
      <Link href={`/dashboard/incidents/admin/view/${id}`}>
        <CardHeader className="max-h-24 flex flex-row items-start justify-between space-y-0 my-0">
          <div>
            <CardTitle className="text-base font-bold">{title}</CardTitle>
            <p className="hidden sm:block text-xs text-muted-foreground mt-1">
              Created at {created_at}
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
          <p className="hidden h-4 md:block text-xs truncate">{description}</p>
        </CardContent>
      </Link>
      <CardFooter className="w-full justify-end px-6 text-semibold text-gray-400 hidden md:flex">
        {status === "Draft" && (
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 focus:ring-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/incidents/admin/build?id=${id}`);
                    }}
                  >
                    <FilePenLine className="h-4 w-4 hover:text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 focus:ring-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(id);
                    }}
                  >
                    <BookPlus className="h-4 w-4 hover:text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Publish</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="h-5" />
          </div>
        )}
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0 focus:ring-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(id);
                  }}
                >
                  <Copy className="h-4 w-4 hover:text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0 focus:ring-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  <Trash2 className="h-4 w-4 hover:text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}
