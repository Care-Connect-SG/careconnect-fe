"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FormElementData } from "@/hooks/use-form-reducer";
import { CalendarIcon } from "lucide-react";

interface FormElementViewProps {
  element: FormElementData;
}

export default function FormElementView({ element }: FormElementViewProps) {
  return (
    <>
      <Card className="py-0">
        <CardHeader className="pb-4 pt-2">
          <CardTitle className="p-0 mb-0 max-h-10 flex items-center">
            <h1 className="md:text-base md:max-w-80 max-w-52 pb-0 font-semibold text-black px-0 pt-4">
              {element.label} {element.required ? "*" : ""}
            </h1>
          </CardTitle>
          {element.helptext && (
            <CardDescription className="max-h-6">
              <p className="md:text-xs py-0 font-normal text-gray-500 px-0">
                {element.helptext}
              </p>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {element.type === "text" && (
            <Input
              disabled
              className="disabled:opacity-100"
              placeholder="Short answer text"
            />
          )}
          {element.type === "textarea" && (
            <Textarea
              disabled
              placeholder="Long answer text"
              className="resize-none disabled:opacity-100"
            />
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
          {element.type === "radio" && (
            <RadioGroup className="flex flex-col space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    disabled
                    value={option}
                    id={`option-${element.element_id}-${index}`}
                    className="mr-2"
                  />
                  <Input
                    value={option}
                    disabled
                    className="w-52 border-0 disabled:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              ))}
            </RadioGroup>
          )}
          {element.type === "checkbox" && (
            <div className="flex flex-col space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox disabled className="mr-2" />
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
