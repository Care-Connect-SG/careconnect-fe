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
import DateTimePicker from "./date-time-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";

interface FormElementFillProps {
    element: FormElementData;
    onInputChange: (form_element_id: string, input: any) => void;
}

export default function FormElementFill({
    element,
    onInputChange
}: FormElementFillProps) {
    const [value, setValue] = useState<string | string[]>(element.type === "checkbox" ? [] : "");

    useEffect(() => {
        if (value) {
            onInputChange(element.id, value);
        }
    }, [value]);

    return (
        <Card className="py-0">
            <CardHeader>
                <CardTitle className="md:text-lg md:font-semibold">
                    {element.label} {element.required ? "*" : ""}
                </CardTitle>
                {element.helptext && (
                    <CardDescription>
                        element.helptext
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="">
                {element.type === "text" && (
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Short answer text" />
                )}
                {element.type === "textarea" && (
                    <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Long answer text"
                        className="resize-none"
                    />
                )}
                {element.type === "date" && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={value ? "" : "text-muted-foreground"}>
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                {value ? format(new Date(value as string), "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={value ? new Date(value as string) : undefined}
                                onSelect={(date) => setValue(date ? format(date, "yyyy-MM-dd") : "")}
                            />
                        </PopoverContent>
                    </Popover>
                )}
                {element.type === "datetime" && (
                    <DateTimePicker
                        id={element.id}
                        type={element.type}
                        value={value as string}
                        onChange={(val) => setValue(val)}
                    />
                )}
                {element.type === "radio" && element.options && (
                    <div>
                        {element.options.map((option) => (
                            <label key={option} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name={element.id}
                                    value={option}
                                    checked={value === option}
                                    onChange={() => setValue(option)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                )}
                {element.type === "checkbox" && element.options && (
                    <div>
                        {element.options.map((option) => (
                            <label key={option} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={Array.isArray(value) && value.includes(option)}
                                    onChange={() =>
                                        setValue((prev: any) =>
                                            prev.includes(option)
                                                ? prev.filter((item: string) => item !== option)
                                                : [...prev, option]
                                        )
                                    }
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


