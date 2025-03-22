"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Input } from "./input";

interface TimePickerInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: string;
  onChange: (value: string) => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(({ className, value, onChange, ...props }, ref) => {
  const [time, setTime] = React.useState(value || "");

  React.useEffect(() => {
    setTime(value || "");
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    onChange(newTime);
  };

  return (
    <Input
      type="time"
      value={time}
      onChange={handleTimeChange}
      className={cn("w-full", className)}
      ref={ref}
      {...props}
    />
  );
});

TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput };
