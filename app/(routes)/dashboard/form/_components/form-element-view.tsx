"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormElementData } from "@/hooks/useFormReducer";
import { CalendarClockIcon, CalendarIcon } from "lucide-react";

interface FormElementViewProps {
  element: FormElementData;
}

export default function FormElementView({ element }: FormElementViewProps) {
  return (
    <>
      <Card className="py-0">
        <CardHeader className="pb-6 pt-2">
          <CardTitle className="p-0 mb-0 max-h-10 flex items-center">
            <Input
              value={`${element.label} ${element.required ? "*" : ""}`}
              disabled
              className="md:text-base md:max-w-80 max-w-52 pb-0 font-semibold text-black rounded-none border-0 
                         px-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100"
              placeholder="Label"
            />
          </CardTitle>
          {element.helptext && (
            <CardDescription className="max-h-6">
              <Input
                value={element.helptext}
                disabled
                className="md:text-xs py-0 font-normal rounded-none border-0 text-gray-500
                        px-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100"
                placeholder="Add a description for the form field"
              />
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {element.type === "text" && (
            <Input
              disabled
              className="disabled:opacity-100"
              placeholder="Short answer text"
            ></Input>
          )}
          {element.type === "textarea" && (
            <Textarea
              disabled
              placeholder="Long answer text"
              className="resize-none disabled:opacity-100"
            ></Textarea>
          )}
          {element.type === "date" && (
            <Button
              disabled
              variant={"outline"}
              className="w-[240px] justify-start text-left font-normal disabled:opacity-100"
            >
              <CalendarIcon />
              <span>Pick a date</span>
            </Button>
          )}
          {element.type === "datetime" && (
            <Button
              disabled
              variant={"outline"}
              className="w-[240px] justify-start text-left font-normal disabled:opacity-100"
            >
              <CalendarClockIcon />
              <span>MM/DD/YYYY hh:mm</span>
            </Button>
          )}
          {element.type === "radio" && (
            <div className="flex flex-col space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" disabled className="mr-2" />
                  <Input
                    value={option}
                    disabled
                    className="w-52 border-0 disabled:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              ))}
            </div>
          )}
          {element.type === "checkbox" && (
            <div className="flex flex-col space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="mr-2" />
                  <Input
                    value={option}
                    disabled
                    className="w-52 border-0 disabled:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
