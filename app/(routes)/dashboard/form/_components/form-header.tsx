"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormHeaderEditProps {
  title: string;
  description: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface FormHeaderViewProps {
  title: string;
  description: string;
}

function FormHeaderEdit({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: FormHeaderEditProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Input
              value={title}
              onChange={onTitleChange}
              className="md:text-2xl font-bold rounded-none border-0 border-b-2 border-transparent 
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Untitled Form"
            />
          </CardTitle>
          <CardDescription>
            <Textarea
              value={description}
              onChange={onDescriptionChange}
              className="rounded-none border-0 border-b border-transparent overflow-hidden pb-2 resize-none
                            hover:border-gray-500 focus:border-gray-500 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Add a description for your form"
              rows={2}
            ></Textarea>
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}

function FormHeaderView({ title, description }: FormHeaderViewProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="md:text-2xl font-bold px-0">{title}</h1>
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
