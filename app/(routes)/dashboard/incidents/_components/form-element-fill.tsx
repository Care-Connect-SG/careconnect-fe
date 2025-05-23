"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DateTimePicker,
  convertDateTimeToString,
  parseStringToDateTime,
} from "@/components/ui/datetime-picker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormElementData } from "@/types/form";

interface FormElementFillProps {
  element: FormElementData;
  value: string | string[];
  onInputChange: (inputValue: any) => void;
}

export default function FormElementFill({
  element,
  value,
  onInputChange,
}: FormElementFillProps) {
  const { element_id, type, label, required, helptext, options } = element;

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onInputChange(e.target.value);
  };

  const handleDateSelect = (date: Date | undefined) => {
    const formatted = date ? format(date, "yyyy-MM-dd") : "";
    onInputChange(formatted);
  };

  const handleRadioChange = (option: string) => {
    onInputChange(option);
  };

  const handleCheckboxChange = (option: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    const newValue = currentValue.includes(option)
      ? currentValue.filter((item) => item !== option)
      : [...currentValue, option];
    onInputChange(newValue);
  };

  const handleDateTimePickerChange = (datetime: Date) => {
    const datetimeString = convertDateTimeToString(datetime);
    onInputChange(datetimeString);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="md:text-lg md:font-semibold">
          {label}
          {required ? " *" : ""}
        </CardTitle>
        {helptext && <CardDescription>{helptext}</CardDescription>}
      </CardHeader>

      <CardContent>
        {type === "text" && (
          <Input
            value={typeof value === "string" ? value : ""}
            onChange={handleTextChange}
            placeholder="Short answer text"
          />
        )}

        {type === "textarea" && (
          <Textarea
            value={typeof value === "string" ? value : ""}
            onChange={handleTextChange}
            placeholder="Long answer text"
            className="resize-none"
          />
        )}

        {type === "date" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                {value
                  ? format(new Date(value as string), "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value as string) : undefined}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        )}

        {type === "datetime" && (
          <DateTimePicker
            value={value ? parseStringToDateTime(value as string) : undefined}
            onChange={handleDateTimePickerChange}
          />
        )}

        {type === "radio" && options && (
          <RadioGroup
            className="flex flex-col gap-2"
            value={typeof value === "string" ? value : ""}
            onValueChange={handleRadioChange}
          >
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem
                  value={option}
                  id={`option-${element_id}-${option}`}
                  className="mr-2"
                />
                <Label htmlFor={`option-${element_id}-${option}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {type === "checkbox" && options && (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={() => handleCheckboxChange(option)}
                />
                <Label>{option}</Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
