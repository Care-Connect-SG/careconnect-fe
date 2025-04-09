"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";
import { Clock, MinusIcon, PlusCircle, PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { MedicationFormSchema } from "../schema";

type Time = {
  hour: number;
  minute: number;
};

type SchedulerProps = {
  onDialogClose?: () => void;
};

export function WeekMedicationScheduler({ onDialogClose }: SchedulerProps) {
  const { setValue, watch, reset } = useFormContext<MedicationFormSchema>();

  const timings = watch("times_of_day") || [{ hour: 8, minute: 0 }];
  const days = watch("days_of_week") || [];
  const repeat = watch("repeat") || 1;

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (onDialogClose) {
      const originalOnDialogClose = onDialogClose;
      onDialogClose = () => {
        setValue("times_of_day", [{ hour: 8, minute: 0 }]);
        setValue("days_of_week", []);
        setValue("repeat", 1);
        originalOnDialogClose();
      };
    }
  }, [onDialogClose, setValue]);

  function toggleDay(day: string) {
    setValue(
      "days_of_week",
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );
  }

  const formatTimeDisplay = (t: Time) => {
    const date = new Date();
    date.setHours(t.hour);
    date.setMinutes(t.minute);
    return format(date, "h:mm a");
  };

  const updateTiming = (index: number, field: keyof Time, value: number) => {
    setValue(
      "times_of_day",
      timings.map((time: Time, i: number) =>
        i === index ? { ...time, [field]: value } : time,
      ),
    );
  };

  const addTiming = () => {
    setValue("times_of_day", [...timings, { hour: 8, minute: 0 }]);
  };

  const removeTiming = (index: number) => {
    setValue(
      "times_of_day",
      timings.filter((_: Time, i: number) => i !== index),
    );
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-medium text-blue-800">
        Schedule by Week
      </h3>

      <div className="mb-6">
        <Label className="mb-2 block text-sm font-medium text-gray-700">
          Days of the week
        </Label>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => {
            const isSelected = days.includes(day);
            return (
              <Button
                key={day}
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleDay(day)}
                className={`${
                  isSelected
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "hover:bg-blue-50"
                } rounded-lg transition-colors`}
              >
                {day}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-700">
            Time of day
          </Label>
          <div className="flex flex-wrap gap-3">
            {timings.map((time, index) => (
              <div key={index} className="relative group">
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md border-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTiming(index)}
                  >
                    ×
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left bg-white rounded-lg border-blue-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                    >
                      <Clock className="mr-2 h-4 w-4 text-blue-600" />
                      {formatTimeDisplay(time)}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 rounded-lg border-blue-200 shadow-lg">
                    <div className="p-4">
                      <div className="flex space-x-2 items-center">
                        <Select
                          value={time.hour.toString()}
                          onValueChange={(value) =>
                            updateTiming(index, "hour", parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20 rounded-lg border-blue-200">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-lg font-medium text-blue-800">
                          :
                        </span>

                        <Select
                          value={time.minute.toString()}
                          onValueChange={(value) =>
                            updateTiming(index, "minute", parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20 rounded-lg border-blue-200">
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {Array.from({ length: 12 }).map((_, i) => {
                              const minuteValue = i * 5;
                              return (
                                <SelectItem
                                  key={i}
                                  value={minuteValue.toString()}
                                >
                                  {minuteValue.toString().padStart(2, "0")}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}

            {timings.length < 6 && (
              <Button
                onClick={addTiming}
                variant="outline"
                className="rounded-lg border-dashed border-blue-300 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <PlusIcon className="mr-1 h-4 w-4" /> Add time
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-700">
            Repeat frequency
          </Label>
          <div className="bg-white rounded-lg border border-blue-200 px-3 py-0.5 inline-flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Every</span>
            <div className="flex items-center  overflow-hidden  border-blue-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue("repeat", Math.max(1, repeat - 1))}
                disabled={repeat <= 1}
                className="h-8 w-8 flex-shrink-0 rounded-none border-0 border-r border-blue-200 bg-transparent hover:bg-blue-50 focus:ring-0 focus:ring-offset-0"
              >
                <MinusIcon className="h-3 w-3 text-blue-600" />
              </Button>
              <Input
                type="number"
                value={repeat}
                onChange={(e) =>
                  setValue("repeat", Math.max(1, Number(e.target.value)))
                }
                className="w-12 h-8 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent"
                min={1}
                step={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue("repeat", repeat + 1)}
                className="h-8 w-8 flex-shrink-0 rounded-none border-0 border-l border-blue-200 bg-transparent hover:bg-blue-50 focus:ring-0 focus:ring-offset-0"
              >
                <PlusIcon className="h-3 w-3 text-blue-600" />
              </Button>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {repeat === 1 ? "week" : "weeks"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DayMedicationScheduler({ onDialogClose }: SchedulerProps) {
  const { setValue, watch, reset } = useFormContext<MedicationFormSchema>();

  const timings = watch("times_of_day") || [{ hour: 8, minute: 0 }];
  const repeat = watch("repeat") || 1;

  useEffect(() => {
    if (onDialogClose) {
      const originalOnDialogClose = onDialogClose;
      onDialogClose = () => {
        setValue("times_of_day", [{ hour: 8, minute: 0 }]);
        setValue("repeat", 1);
        originalOnDialogClose();
      };
    }
  }, [onDialogClose, setValue]);

  const formatTimeDisplay = (t: Time) => {
    const date = new Date();
    date.setHours(t.hour);
    date.setMinutes(t.minute);
    return format(date, "h:mm a");
  };

  const updateTiming = (index: number, field: keyof Time, value: number) => {
    setValue(
      "times_of_day",
      timings.map((time: Time, i: number) =>
        i === index ? { ...time, [field]: value } : time,
      ),
    );
  };

  const addTiming = () => {
    setValue("times_of_day", [...timings, { hour: 8, minute: 0 }]);
  };

  const removeTiming = (index: number) => {
    setValue(
      "times_of_day",
      timings.filter((_: Time, i: number) => i !== index),
    );
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-medium text-blue-800">
        Schedule by Day
      </h3>

      <div className="flex flex-col gap-4">
        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-700">
            Time of day
          </Label>

          <div className="flex flex-wrap gap-3">
            {timings.map((time, index) => (
              <div key={index} className="relative group">
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md border-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTiming(index)}
                  >
                    ×
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left bg-white rounded-lg border-blue-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                    >
                      <Clock className="mr-2 h-4 w-4 text-blue-600" />
                      {formatTimeDisplay(time)}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 rounded-lg border-blue-200 shadow-lg">
                    <div className="p-4">
                      <div className="flex space-x-2 items-center">
                        <Select
                          value={time.hour.toString()}
                          onValueChange={(value) =>
                            updateTiming(index, "hour", parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20 rounded-lg border-blue-200">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-lg font-medium text-blue-800">
                          :
                        </span>

                        <Select
                          value={time.minute.toString()}
                          onValueChange={(value) =>
                            updateTiming(index, "minute", parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20 rounded-lg border-blue-200">
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {Array.from({ length: 12 }).map((_, i) => {
                              const minuteValue = i * 5;
                              return (
                                <SelectItem
                                  key={i}
                                  value={minuteValue.toString()}
                                >
                                  {minuteValue.toString().padStart(2, "0")}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
            {timings.length < 6 && (
              <Button
                onClick={addTiming}
                variant="outline"
                className="rounded-lg border-dashed border-blue-300 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <PlusIcon className="mr-1 h-4 w-4" /> Add time
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-700">
            Repeat frequency
          </Label>
          <div className="bg-white rounded-lg border border-blue-200 px-3 py-0.5 inline-flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Every</span>
            <div className="flex items-center  overflow-hidden  border-blue-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue("repeat", Math.max(1, repeat - 1))}
                disabled={repeat <= 1}
                className="h-8 w-8 flex-shrink-0 rounded-none border-0 border-r border-blue-200 bg-transparent hover:bg-blue-50 focus:ring-0 focus:ring-offset-0"
              >
                <MinusIcon className="h-3 w-3 text-blue-600" />
              </Button>
              <Input
                type="number"
                value={repeat}
                onChange={(e) =>
                  setValue("repeat", Math.max(1, Number(e.target.value)))
                }
                className="w-12 h-8 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent"
                min={1}
                step={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue("repeat", repeat + 1)}
                className="h-8 w-8 flex-shrink-0 rounded-none border-0 border-l border-blue-200 bg-transparent hover:bg-blue-50 focus:ring-0 focus:ring-offset-0"
              >
                <PlusIcon className="h-3 w-3 text-blue-600" />
              </Button>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {repeat === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
