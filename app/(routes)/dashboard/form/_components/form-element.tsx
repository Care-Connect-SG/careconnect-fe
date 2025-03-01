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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormElementData } from "@/hooks/useFormReducer";
import { CalendarClockIcon, CalendarIcon, Trash2, X } from "lucide-react";

interface FormElementProps {
  element: FormElementData;
  onUpdate: (id: string, updatedData: Partial<FormElementData>) => void;
  onRemove: (id: string) => void;
}

export default function FormElement({
  element,
  onUpdate,
  onRemove,
}: FormElementProps) {
  const handleOptionChange = (index: number, newValue: string) => {
    const updatedOptions = [...(element.options || [])];
    updatedOptions[index] = newValue;
    onUpdate(element.id, { options: updatedOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (element.options && element.options.length > 1) {
      const updatedOptions = element.options.filter((_, i) => i !== index);
      onUpdate(element.id, { options: updatedOptions });
    }
  };

  return (
    <>
      <Card className="py-0">
        <CardHeader className="pb-6 pt-2">
          <CardTitle className="p-0 mb-0 max-h-10 flex items-center justify-between">
            <Input
              value={element.label}
              onChange={(e) => onUpdate(element.id, { label: e.target.value })}
              className="md:text-base md:max-w-80 max-w-52 pb-0 font-semibold text-black rounded-none border-0 border-b-2 border-transparent 
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Label"
            />
            <div className="flex items-center mt-2">
              <div className="flex items-center space-x-2 text-gray-500">
                <Label>Required</Label>
                <Switch
                  checked={element.required}
                  onCheckedChange={(checked) =>
                    onUpdate(element.id, { required: checked })
                  }
                />
              </div>
              <div className="w-[1.5px] h-6 bg-gray-300 mx-2"></div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500"
                onClick={() => onRemove(element.id)}
              >
                <Trash2></Trash2>
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="max-h-6">
            <Input
              value={element.helptext}
              onChange={(e) =>
                onUpdate(element.id, { helptext: e.target.value })
              }
              className="md:text-xs py-0 font-normal rounded-none border-0 border-b border-transparent text-gray-500 placeholder:text-muted-foreground
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Add a description for the form field"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          {element.type === "text" && (
            <Input disabled placeholder="Short answer text"></Input>
          )}
          {element.type === "textarea" && (
            <Textarea
              disabled
              placeholder="Long answer text"
              className="resize-none"
            ></Textarea>
          )}
          {element.type === "date" && (
            <Button
              disabled
              variant={"outline"}
              className="w-[240px] justify-start text-left font-normal text-muted-foreground"
            >
              <CalendarIcon />
              <span>Pick a date</span>
            </Button>
          )}
          {element.type === "datetime" && (
            <Button
              disabled
              variant={"outline"}
              className="w-[240px] justify-start text-left font-normal text-muted-foreground"
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
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-52 focus:border-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="New Option"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleRemoveOption(index)}
                    disabled={index === 0}
                  >
                    <X className={index === 0 ? "hidden" : ""} />
                  </Button>
                </div>
              ))}
              {/* TODO: Validate that option value is not empty */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(element.id, {
                    options: [...(element.options || []), ""],
                  })
                }
              >
                + Add Option
              </Button>
            </div>
          )}
          {element.type === "checkbox" && (
            <div className="flex flex-col space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="mr-2" />
                  <Input
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...(element.options || [])];
                      updatedOptions[index] = e.target.value;
                      onUpdate(element.id, { options: updatedOptions });
                    }}
                    className="w-52 focus:border-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="New Option"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleRemoveOption(index)}
                    disabled={index === 0}
                  >
                    <X className={index === 0 ? "hidden" : ""} />
                  </Button>
                </div>
              ))}
              {/* TODO: Validate that option value is not empty */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(element.id, {
                    options: [...(element.options || []), ""],
                  })
                }
              >
                + Add Option
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
