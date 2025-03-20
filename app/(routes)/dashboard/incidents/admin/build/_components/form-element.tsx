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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClockIcon, CalendarIcon, Trash2, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormSchema } from "../schema";

interface FormElementProps {
  index: number;
  removeElement: (index: number) => void;
}

export default function FormElement({
  index,
  removeElement,
}: FormElementProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormSchema>();
  const element = watch(`elements.${index}`);
  const elementError = errors.elements?.[index];

  return (
    <>
      <Card className="py-0">
        <CardHeader className="pb-6 pt-2">
          <CardTitle className="p-0 mb-0 max-h-10 flex items-center justify-between">
            <Input
              {...register(`elements.${index}.label`)}
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
                    setValue(`elements.${index}.required`, checked)
                  }
                />
              </div>
              <div className="w-[1.5px] h-6 bg-gray-300 mx-2"></div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500"
                onClick={() => removeElement(index)}
              >
                <Trash2 />
              </Button>
            </div>
          </CardTitle>
          {elementError?.label && (
            <p className="text-xs text-red-500">{elementError.label.message}</p>
          )}
          <CardDescription className="max-h-6">
            <Input
              {...register(`elements.${index}.helptext`)}
              className="md:text-xs py-0 font-normal rounded-none border-0 border-b border-transparent text-gray-500 placeholder:text-muted-foreground
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Add a description for the form field"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          {element.type === "text" && (
            <Input disabled placeholder="Short answer text" />
          )}
          {element.type === "textarea" && (
            <Textarea
              disabled
              placeholder="Long answer text"
              className="resize-none"
            />
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
              <span>Pick a date and time</span>
            </Button>
          )}
          {element.type === "radio" && (
            <RadioGroup className="flex flex-col space-y-2">
              {element.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem
                    disabled
                    value={option}
                    id={`option-${element.element_id}-${index}`}
                    className="mr-2"
                  />
                  <Input
                    value={option}
                    onChange={(e) =>
                      setValue(
                        `elements.${index}.options.${optionIndex}`,
                        e.target.value,
                      )
                    }
                    className="w-52 focus:border-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="New Option"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      const opts = element.options?.filter(
                        (_, i) => i !== optionIndex,
                      );
                      setValue(`elements.${index}.options`, opts);
                    }}
                    disabled={optionIndex === 0}
                  >
                    <X className={optionIndex === 0 ? "hidden" : ""} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue(`elements.${index}.options`, [
                    ...(element.options || []),
                    "",
                  ])
                }
              >
                + Add Option
              </Button>
            </RadioGroup>
          )}
          {element.type === "checkbox" && (
            <div className="flex flex-col space-y-2">
              {element.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Checkbox disabled className="mr-2" />
                  <Input
                    value={option}
                    onChange={(e) =>
                      setValue(
                        `elements.${index}.options.${optionIndex}`,
                        e.target.value,
                      )
                    }
                    className="w-52 focus:border-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="New Option"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      const opts = element.options?.filter(
                        (_, i) => i !== optionIndex,
                      );
                      setValue(`elements.${index}.options`, opts);
                    }}
                    disabled={optionIndex === 0}
                  >
                    <X className={optionIndex === 0 ? "hidden" : ""} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue(`elements.${index}.options`, [
                    ...(element.options || []),
                    "",
                  ])
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
