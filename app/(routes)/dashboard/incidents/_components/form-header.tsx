"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { FormSchema } from "../admin/build/schema";

interface FormHeaderViewProps {
  title: string;
  description: string;
}

function FormHeaderEdit() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormSchema>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Input
            {...register("title")}
            className="md:text-2xl font-bold rounded-none border-0 border-b-2 border-transparent 
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Untitled Form"
          />
        </CardTitle>
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
        <CardDescription>
          <Textarea
            {...register("description")}
            className="rounded-none border-0 border-b border-transparent overflow-hidden pb-2 resize-none
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Add a description for your form"
            rows={2}
          ></Textarea>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function FormHeaderView({ title, description }: FormHeaderViewProps) {
  return (
    <>
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>
            <h1 className="md:text-3xl font-bold px-0">{title}</h1>
          </CardTitle>
          <CardDescription>
            <p>{description}</p>
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}

export { FormHeaderEdit, FormHeaderView };
