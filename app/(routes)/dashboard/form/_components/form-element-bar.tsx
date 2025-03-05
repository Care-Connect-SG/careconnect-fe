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
import React from "react";

interface FormElementBarItem {
  type: FormElementType;
  item: React.ReactElement<{ className?: string }>;
  color: string;
}

interface FormElementBarProps {
  onAddElement: (type: FormElementType) => void;
}

export default function FormElementBar({ onAddElement }: FormElementBarProps) {
  const formElementBarItems: FormElementBarItem[] = [
    {
      type: "text",
      item: <Type />,
      color: "bg-sky-100",
    },
    {
      type: "textarea",
      item: <AlignLeft />,
      color: "bg-orange-100",
    },
    {
      type: "date",
      item: <Calendar />,
      color: "bg-emerald-100",
    },
    {
      type: "datetime",
      item: <Clock />,
      color: "bg-lime-100",
    },
    {
      type: "radio",
      item: <ListChecks />,
      color: "bg-rose-100",
    },
    {
      type: "checkbox",
      item: <CheckSquare />,
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
                className={`group h-10 w-10 ${item.color} hover:shadow-md group-hover:text-white`}
              >
                {React.cloneElement(item.item, {
                  className: "h-5 w-5 text-gray-600 group-hover:text-white",
                })}
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
