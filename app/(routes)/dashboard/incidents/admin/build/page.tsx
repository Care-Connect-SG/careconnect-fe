"use client";

import {
  createForm,
  deleteForm,
  getFormById,
  updateForm,
} from "@/app/api/form";
import { getCurrentUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { FormState, useFormReducer } from "@/hooks/use-form-reducer";
import { toast } from "@/hooks/use-toast";
import { FormCreate } from "@/types/form";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { FormHeaderEdit } from "../../_components/form-header";
import FormElement from "./_components/form-element";
import FormElementBar from "./_components/form-element-bar";
import { FormElementType, FormSchema, formSchema } from "./schema";

export default function CreateFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");
  const isEditing = !!formId;
  const { setPageName } = useBreadcrumb();
  const [user, setUser] = useState<User>();

  const methods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      elements: [],
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields, append } = useFieldArray({ control, name: "elements" });

  useEffect(() => {
    if (isEditing) {
      getFormById(formId)
        .then((data) => {
          reset({
            title: data.title,
            description: data.description,
            elements: data.json_content,
          });
        })
        .catch(() => {
          console.error("Form not found");
          router.replace("/404");
        });
    } else {
      setPageName("Create Form");
    }
  }, [formId, isEditing]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, []);

  const handleSaveDraft = async (form: FormSchema) => {
    const formData: FormCreate = {
      title: form.title,
      description: form.description,
      creator_id: user!.id,
      json_content: form.elements,
      status: "Draft",
    };

    try {
      if (isEditing && formId) {
        await updateForm(formId, formData);
        toast({
          title: "Draft form updated",
          description: "Your draft form is saved updated.",
        });
      } else {
        const newFormId = await createForm(formData);
        router.replace(`/dashboard/incidents/admin/build?id=${newFormId}`);
        toast({
          title: "Draft form created",
          description: "Your form is saved successfully as a draft.",
        });
      }
    } catch (error) {
      console.error("Failed to save draft", error);
      toast({
        title: "Error",
        description: "Failed to save the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublishDraft = async (form: FormSchema) => {
    const formData: FormCreate = {
      title: form.title,
      description: form.description,
      creator_id: user!.id,
      json_content: form.elements,
      status: "Published",
    };

    try {
      if (!formId) {
        await createForm(formData);
      } else {
        await updateForm(formId, formData);
      }
      toast({
        title: "Form published.",
        description: "Your form is saved and published successfully.",
      });
      router.replace(`/dashboard/incidents/admin`);
    } catch (error) {
      console.error("Failed to publish form", error);
      toast({
        title: "Error",
        description: "Failed to publish the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDraft = async (formId: string) => {
    try {
      await deleteForm(formId);
      toast({
        title: "Form deleted.",
        description: "Your form has been deleted successfully.",
      });
      router.replace(`/dashboard/incidents/admin`);
    } catch (error) {
      console.error("Failed to delete form");
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddElement = (type: FormElementType) => {
    append({
      element_id: uuidv4(),
      type,
      label: "",
      helptext: "",
      required: false,
      options: ["radio", "checkbox"].includes(type) ? ["Option 1"] : undefined,
    });
  };

  const removeElement = (index: number) => {
    const elements = methods.getValues("elements");
    elements.splice(index, 1);
    methods.setValue("elements", elements);
  };

  return (
    <>
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight py-2">
            Incident Reporting Form Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Design, edit, and publish your incident reporting forms
          </p>
        </div>
      </div>

      <hr className="border-t-1 border-gray-300 mx-8 py-2" />

      <FormProvider {...methods}>
        <div className="flex items-center justify-between pb-2">
          <div className="flex justify-start gap-2 px-8">
            <Link href="/dashboard/incidents/admin">
              <Button variant="outline" className="border h-10 mb-2 rounded-md">
                <ChevronLeft className="h-4 w-4 mx-auto" />
                Return to Manage Forms
              </Button>
            </Link>

            {formId && (
              <Button
                onClick={() => handleDeleteDraft(formId)}
                className="bg-gray-100 text-black hover:bg-gray-200"
              >
                <Trash2 />
              </Button>
            )}
          </div>
          <div className="flex justify-end gap-2 px-8 pb-2">
            <Button
              onClick={handleSubmit(handleSaveDraft)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Save
            </Button>
            <Button
              onClick={handleSubmit(handlePublishDraft)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="mx-8 pb-4">
          <FormHeaderEdit />

          <div className="py-4 space-y-4">
            {fields.map((element, idx) => (
              <FormElement
                key={element.element_id}
                index={idx}
                removeElement={removeElement}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <FormElementBar onAddElement={handleAddElement} />
        </div>
      </FormProvider>
    </>
  );
}
