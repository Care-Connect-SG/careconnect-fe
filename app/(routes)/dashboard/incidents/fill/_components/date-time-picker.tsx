"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface DateTimePickerProps {
  id: string;
  type: string;
  value?: string;
  onChange: (id: string, content: string) => void;
}

export default function DateTimePicker({
  id,
  type,
  value,
  onChange,
}: DateTimePickerProps) {
  const [dateTime, setDateTime] = useState<{
    date?: Date;
    hours?: string;
    minutes?: string;
    period?: "AM" | "PM";
  }>({});

  useEffect(() => {
    if (!value || typeof value !== "string") return;

    if (value) {
      try {
        const parts = value.split(" ");
        if (parts.length < 3) return;

        const [datePart, timePart, period] = parts;

        const [hours, minutes] = timePart?.split(":");

        let parsedDate = parse(datePart, "yyyy-MM-dd", new Date());
        if (!isValid(parsedDate)) return;

        let parsedHours = parseInt(hours, 10);
        if (period === "PM" && parsedHours < 12) parsedHours += 12;
        if (period === "AM" && parsedHours === 12) parsedHours = 0;

        setDateTime({
          date: parsedDate,
          hours: (parsedHours % 12 || 12).toString().padStart(2, "0"),
          minutes: minutes.padStart(2, "0"),
          period: period as "AM" | "PM",
        });
      } catch (error) {
        console.error("Failed to parse date-time value:", error);
      }
    }
  }, [value]);

  const updateDateTime = (updatedValues: Partial<typeof dateTime>) => {
    const newDateTime = { ...dateTime, ...updatedValues };

    if (
      newDateTime.date &&
      newDateTime.hours &&
      newDateTime.minutes &&
      newDateTime.period
    ) {
      const fullDateTime = new Date(newDateTime.date);
      let hours = parseInt(newDateTime.hours, 10);

      if (newDateTime.period === "PM" && hours < 12) hours += 12;
      if (newDateTime.period === "AM" && hours === 12) hours = 0;

      fullDateTime.setHours(hours, parseInt(newDateTime.minutes, 10));

      const formattedDateTime = format(fullDateTime, "yyyy-MM-dd hh:mm a");
      onChange(id, formattedDateTime);
    }

    setDateTime(newDateTime);
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  return (
    <div className="space-y-3">
      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dateTime.date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTime.date ? (
              format(dateTime.date, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateTime.date}
            onSelect={(date) => updateDateTime({ date })}
          />
        </PopoverContent>
      </Popover>

      {/* Time Selectors */}
      <div className="flex items-center gap-2">
        <div className="w-1/6">
          <Label>Hours</Label>
          <Select
            value={dateTime.hours}
            onValueChange={(value) => updateDateTime({ hours: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-1/6">
          <Label>Minutes</Label>
          <Select
            value={dateTime.minutes}
            onValueChange={(value) => updateDateTime({ minutes: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-1/6">
          <Label>AM/PM</Label>
          <Select
            value={dateTime.period}
            onValueChange={(value: "AM" | "PM") =>
              updateDateTime({ period: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
