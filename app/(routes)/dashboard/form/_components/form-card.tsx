import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Eye, FilePenLine } from "lucide-react";

interface FormCardProps {
  title: string;
  description: string;
  created_date: string;
  status: string;
}

export default function FormCard({
  title,
  description,
  created_date,
  status,
}: FormCardProps) {
  return (
    <Card
      className={`w-xs max-w-xs h-[10rem] overflow-hidden ${
        status === "Published"
          ? "border-l-4 border-l-green-500"
          : "border-l-4 border-l-yellow-500"
      }`}
    >
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
      {/* <CardFooter className={`flex justify-end gap-2`}>
                {status === "Draft" && (
                    <FilePenLine className="h-4 w-4" />
                )}
                <Eye className="h-4 w-4" />
            </CardFooter> */}
    </Card>
  );
}
