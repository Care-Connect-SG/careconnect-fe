"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { FormElementData } from "@/hooks/useFormReducer";

// We also pass the current 'value'
interface FormElementFillProps {
  element: FormElementData;
  value: string | string[];  // Current value for this field
  // This method updates the global state in the parent
  onInputChange: (form_element_id: string, inputValue: any) => void;
}

export default function FormElementFill({
  element,
  value,
  onInputChange,
}: FormElementFillProps) {
  // For readability, destructure a bit:
  const { element_id, type, label, required, helptext, options } = element;

  // Handler for updating a "text" or "textarea" field
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInputChange(element_id, e.target.value);
  };

  // Handler for picking a date
  const handleDateSelect = (date: Date | undefined) => {
    const formatted = date ? format(date, "yyyy-MM-dd") : "";
    onInputChange(element_id, formatted);
  };

  // For radio and checkbox fields, we'll define separate handlers
  const handleRadioChange = (option: string) => {
    onInputChange(element_id, option);
  };

  const handleCheckboxChange = (option: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    const newValue = currentValue.includes(option)
      ? currentValue.filter((item) => item !== option)
      : [...currentValue, option];
    onInputChange(element_id, newValue);
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

        {type === "radio" && options && (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={element_id}
                  value={option}
                  checked={value === option}
                  onChange={() => handleRadioChange(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {type === "checkbox" && options && (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
