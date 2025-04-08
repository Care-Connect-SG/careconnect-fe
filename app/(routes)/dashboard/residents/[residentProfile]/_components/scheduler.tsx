import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, MinusIcon, PlusIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, set } from "date-fns";
import { Input } from "@/components/ui/input";

type Time = {
    hour: number;
    minute: number;
};

export function WeekMedicationScheduler() {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [timings, setTimings] = useState<Time[]>([{ hour: 0, minute: 0 }]);
    const [repeatFreq, setRepeatFreq] = useState(1);

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    function toggleDay(day: string) {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    }

    const formatTimeDisplay = (t: Time) => {
        const date = new Date();
        date.setHours(t.hour);
        date.setMinutes(t.minute);
        return format(date, "h:mm a");
    };

    const updateTiming = (index: number, field: keyof Time, value: number) => {
        setTimings(prev =>
            prev.map((time, i) =>
                i === index ? { ...time, [field]: value } : time
            )
        );
    };

    const addTiming = () => {
        setTimings(prev => [...prev, { hour: 0, minute: 0 }]);
    };

    const removeTiming = (index: number) => {
        setTimings(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="rounded border border-0 bg-blue-50 p-4">
            <div className="grid grid-cols-7 gap-4">
                {daysOfWeek.map(day => {
                    const isSelected = selectedDays.includes(day);
                    const variant = isSelected ? "default" : "outline";

                    return (
                        <Button
                            key={day}
                            variant={variant}
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </Button>
                    );
                })}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
                {timings.map((time, index) => (
                    <div key={index} className="relative w-fit">
                        {
                            index > 0 && (<Button
                                variant="outline"
                                size="icon"
                                className="absolute -top-1 -right-2 h-5 w-5 p-0 text-lg font-light rounded-full text-gray-500"
                                onClick={() => removeTiming(index)}
                            >
                                ×
                            </Button>)
                        }
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {formatTimeDisplay(time)}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0">
                                <div className="p-4">
                                    <div className="flex space-x-2 items-center">
                                        <Select
                                            value={time.hour.toString()}
                                            onValueChange={(value) =>
                                                updateTiming(index, "hour", parseInt(value))
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue placeholder="Hour" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>
                                                        {i.toString().padStart(2, "0")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <span>:</span>

                                        <Select
                                            value={time.minute.toString()}
                                            onValueChange={(value) =>
                                                updateTiming(index, "minute", parseInt(value))
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue placeholder="Minute" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }).map((_, i) => {
                                                    const minuteValue = i * 5;
                                                    return (
                                                        <SelectItem key={i} value={minuteValue.toString()}>
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


            </div>


            <div className="grid grid-cols-3 items-center gap-4 mt-4">
                <Button onClick={addTiming} disabled={timings.length >= 6} className="col-span-1">
                    + Add Timing
                </Button>
                <div className="bg-card rounded-lg border shadow-sm py-2 px-4 flex items-center gap-3 col-span-2">
                    {/* <RepeatIcon className="h-4 w-4 text-blue-500 font-bold" /> */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">Repeat every</span>
                        <div className={`flex items-center border rounded-md overflow-hidden bg-background`}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRepeatFreq(Math.max(1, repeatFreq - 1))}
                                disabled={repeatFreq <= 1}
                                className="h-6 w-6 px-0 flex-shrink-0 rounded-none border-0 border-r"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </Button>
                            <Input
                                type="number"
                                value={repeatFreq}
                                onChange={(e) => setRepeatFreq(Math.max(1, Number(e.target.value)))}
                                className="w-12 h-6 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={2}
                                step={1}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRepeatFreq(repeatFreq + 1)}
                                className="h-6 w-6 px-0 flex-shrink-0 rounded-none border-0 border-l"
                            >
                                <PlusIcon className="h-3 w-3" />
                            </Button>
                        </div>
                        <span className="text-sm font-medium text-foreground">{repeatFreq === 1 ? "week" : "weeks"}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}

export function DayMedicationScheduler() {
    const [timings, setTimings] = useState<Time[]>([{ hour: 0, minute: 0 }]);
    const [repeatFreq, setRepeatFreq] = useState(1);

    const formatTimeDisplay = (t: Time) => {
        const date = new Date();
        date.setHours(t.hour);
        date.setMinutes(t.minute);
        return format(date, "h:mm a");
    };

    const updateTiming = (index: number, field: keyof Time, value: number) => {
        setTimings(prev =>
            prev.map((time, i) =>
                i === index ? { ...time, [field]: value } : time
            )
        );
    };

    const addTiming = () => {
        setTimings(prev => [...prev, { hour: 0, minute: 0 }]);
    };

    const removeTiming = (index: number) => {
        setTimings(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="rounded border border-0 bg-blue-50 p-4">
            <div className="grid grid-cols-3 gap-4">
                {timings.map((time, index) => (
                    <div key={index} className="relative w-fit">
                        {
                            index > 0 && (<Button
                                variant="outline"
                                size="icon"
                                className="absolute -top-1 -right-2 h-5 w-5 p-0 text-lg font-light rounded-full text-gray-500"
                                onClick={() => removeTiming(index)}
                            >
                                ×
                            </Button>)
                        }
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {formatTimeDisplay(time)}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0">
                                <div className="p-4">
                                    <div className="flex space-x-2 items-center">
                                        <Select
                                            value={time.hour.toString()}
                                            onValueChange={(value) =>
                                                updateTiming(index, "hour", parseInt(value))
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue placeholder="Hour" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>
                                                        {i.toString().padStart(2, "0")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <span>:</span>

                                        <Select
                                            value={time.minute.toString()}
                                            onValueChange={(value) =>
                                                updateTiming(index, "minute", parseInt(value))
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue placeholder="Minute" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }).map((_, i) => {
                                                    const minuteValue = i * 5;
                                                    return (
                                                        <SelectItem key={i} value={minuteValue.toString()}>
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
            </div>


            <div className="grid grid-cols-3 items-center gap-4 mt-4">
                <Button onClick={addTiming} disabled={timings.length >= 6} className="col-span-1">
                    + Add Timing
                </Button>
                <div className="bg-card rounded-lg border shadow-sm py-2 px-4 flex items-center gap-3 col-span-2">
                    {/* <RepeatIcon className="h-4 w-4 text-blue-500 font-bold" /> */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">Repeat every</span>
                        <div className={`flex items-center border rounded-md overflow-hidden bg-background`}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRepeatFreq(Math.max(1, repeatFreq - 1))}
                                disabled={repeatFreq <= 1}
                                className="h-6 w-6 px-0 flex-shrink-0 rounded-none border-0 border-r"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </Button>
                            <Input
                                type="number"
                                value={repeatFreq}
                                onChange={(e) => setRepeatFreq(Math.max(1, Number(e.target.value)))}
                                className="w-12 h-6 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={2}
                                step={1}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRepeatFreq(repeatFreq + 1)}
                                className="h-6 w-6 px-0 flex-shrink-0 rounded-none border-0 border-l"
                            >
                                <PlusIcon className="h-3 w-3" />
                            </Button>
                        </div>
                        <span className="text-sm font-medium text-foreground">{repeatFreq === 1 ? "day" : "days"}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
