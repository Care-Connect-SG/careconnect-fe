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
import { format, getHours, getMinutes, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

export interface DateTimePickerValue {
  date?: Date;
  hours?: string;
  minutes?: string;
  period?: "AM" | "PM";
}

interface DateTimePickerProps {
  value?: DateTimePickerValue;
  onChange?: (newValue: DateTimePickerValue) => void;
}

export const convertDateTimeToString = (datetimeValue: DateTimePickerValue) => {
  if (
    datetimeValue.date &&
    datetimeValue.hours &&
    datetimeValue.minutes &&
    datetimeValue.period
  ) {
    const fullDateTime = new Date(datetimeValue.date);
    let hours = parseInt(datetimeValue.hours, 10);

    if (datetimeValue.period === "PM" && hours < 12) hours += 12;
    if (datetimeValue.period === "AM" && hours === 12) hours = 0;

    fullDateTime.setHours(hours, parseInt(datetimeValue.minutes, 10));

    const formattedDateTime = format(fullDateTime, "yyyy-MM-dd hh:mm a");
    return formattedDateTime;
  }
};

export const parseDateTimeString = (
  datetimeString: string,
): DateTimePickerValue => {
  const parsedDate = parse(datetimeString, "yyyy-MM-dd hh:mm a", new Date());
  if (!isValid(parsedDate)) {
    return {};
  }

  let hours24 = getHours(parsedDate);
  const minutes = getMinutes(parsedDate);
  const period = hours24 < 12 ? "AM" : "PM";

  // Convert 24-hour to 12-hour
  if (hours24 === 0) {
    hours24 = 12;
  } else if (hours24 > 12) {
    hours24 = hours24 - 12;
  }

  const hoursString = String(hours24).padStart(2, "0");
  const minutesString = String(minutes).padStart(2, "0");

  return {
    date: parsedDate,
    hours: hoursString,
    minutes: minutesString,
    period,
  };
};

export default function DateTimePicker({
  value,
  onChange,
}: DateTimePickerProps) {
  const [internalValue, setInternalValue] = useState<DateTimePickerValue>(
    value ?? {},
  );

  useEffect(() => {
    if (value) {
      setInternalValue(value);
    }
  }, [value]);

  function updateDateTime(updatedFields: Partial<DateTimePickerValue>) {
    const merged = { ...internalValue, ...updatedFields };
    setInternalValue(merged);
    onChange?.(merged);
  }

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
          <div className="flex flex-col gap-1">
            <Label>Date</Label>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !internalValue.date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {internalValue.date ? (
                format(internalValue.date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={internalValue.date}
            onSelect={(date) => updateDateTime({ date })}
          />
        </PopoverContent>
      </Popover>

      {/* Time Selectors */}
      <div className="flex items-center gap-2">
        <div className="w-1/6">
          <Label>Hours</Label>
          <Select
            value={internalValue.hours}
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
            value={internalValue.minutes}
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
            value={internalValue.period}
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
