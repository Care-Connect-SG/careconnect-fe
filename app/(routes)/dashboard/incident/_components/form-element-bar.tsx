"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormElementType } from "@/hooks/useFormReducer";
import { Separator } from "@radix-ui/react-separator";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  Clock,
  ListChecks,
  Type,
} from "lucide-react";

interface FormElementBarItem {
  type: FormElementType;
  item: React.ReactNode;
  color: string;
}

interface FormElementBarProps {
  onAddElement: (type: FormElementType) => void;
}

export default function FormElementBar({ onAddElement }: FormElementBarProps) {
  const formElementBarItems: FormElementBarItem[] = [
    {
      type: "text",
      item: <Type className="h-5 w-5 text-gray-600" />,
      color: "bg-sky-100",
    },
    {
      type: "textarea",
      item: <AlignLeft className="h-5 w-5 text-gray-600" />,
      color: "bg-orange-100",
    },
    {
      type: "date",
      item: <Calendar className="h-5 w-5 text-gray-600" />,
      color: "bg-emerald-100",
    },
    {
      type: "datetime",
      item: <Clock className="h-5 w-5 text-gray-600" />,
      color: "bg-lime-100",
    },
    {
      type: "radio",
      item: <ListChecks className="h-5 w-5 text-gray-600" />,
      color: "bg-rose-100",
    },
    {
      type: "checkbox",
      item: <CheckSquare className="h-5 w-5 text-gray-600" />,
      color: "bg-purple-100",
    },
  ];

  return (
    <Card>
      <CardContent className="px-0">
        <div className="flex items-center justify-center bg-slate-100 mb-2">
          <p className="text-sm text-gray-600 py-2 font-semibold">
            Add a form element
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 px-4 pt-2">
          {formElementBarItems.map((item, index) => (
            <div key={item.type} className="flex items-center">
              <Button
                size="icon"
                onClick={() => onAddElement(item.type)}
                className={`h-10 w-10 ${item.color} hover:shadow-md`}
              >
                {item.item}
              </Button>
              {index < formElementBarItems.length - 1 && (
                <Separator orientation="vertical" className="h-6 mx-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
