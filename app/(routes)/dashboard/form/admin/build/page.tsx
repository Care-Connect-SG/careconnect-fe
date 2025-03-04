"use client";

import {
  createForm,
  deleteForm,
  getFormById,
  updateForm,
} from "@/app/api/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { FormState, useFormReducer } from "@/hooks/useFormReducer";
import { FormCreate, FormResponse } from "@/types/form";
import { ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense, useState } from "react";
import FormElement from "../../_components/form-element";
import FormElementBar from "../../_components/form-element-bar";
import { FormHeaderEdit } from "../../_components/form-header";
import { useSession } from "next-auth/react";
import { getCurrentUser } from "@/app/api/user";


export default function CreateFormWrapper() {
  return (
    <Suspense fallback={<FormLoadingSkeleton />}>
      <CreateForm />
    </Suspense>
  );
}

function CreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");
  const isEditing = !!formId;
  const { setPageName } = useBreadcrumb();
  const { data: session } = useSession();

  const [state, dispatch] = useFormReducer();
  const [loading, setLoading] = useState<boolean>(isEditing);

  useEffect(() => {
    if (isEditing) {
      getFormById(formId)
        .then((data: FormResponse) => {
          const formState: FormState = {
            title: data.title,
            description: data.description,
            elements: data.json_content,
          };
          dispatch({ type: "SET_FORM", payload: formState });
        })
        .catch(() => {
          console.error("Form not found");
          router.replace("/404");
        })
        .finally(() => setLoading(false));
    } else {
      setPageName("Create Form");
    }
  }, [formId, isEditing, dispatch, router, setPageName]);

  if (loading) return <FormLoadingSkeleton />;

  const handleSaveDraft = async () => {
    if (!state.title || state.elements.length === 0) {
      alert(
        "Incomplete Form: A form should have at least a title and a form element",
      );
      return;
    }

    const user = await getCurrentUser(session!.user!.email!);

    const formData: FormCreate = {
      title: state.title,
      description: state.description,
      creator_id: user.id,
      json_content: state.elements,
      status: "Draft",
    };

    if (!formId) {
      try {
        const formId = await createForm(formData);
        console.log(formId);
        router.replace(`/dashboard/form/admin/build?id=${formId}`);
      } catch (error) {
        console.error("Error saving form:", error);
      }
    } else {
      try {
        await updateForm(formId, formData);
      } catch (error) {
        console.error("Error updating form:", error);
      }
    }
  };

  const handlePublishDraft = async () => {
    if (!state.title || state.elements.length === 0) {
      alert(
        "Incomplete Form: A form should have at least a title and a form element",
      );
      return;
    }

    const formData: FormCreate = {
      title: state.title,
      description: state.description,
      creator_id: "user123", // TODO: Replace with actual user ID
      json_content: state.elements,
      status: "Published",
    };

    if (!formId) {
      try {
        await createForm(formData);
        router.replace(`/dashboard/form/admin`);
      } catch (error) {
        console.error("Error saving form:", error);
      }
    } else {
      try {
        await updateForm(formId, formData);
        router.replace(`/dashboard/form/admin`);
      } catch (error) {
        console.error("Error updating form:", error);
      }
    }
  };

  const handleDeleteDraft = async (formId: string) => {
    try {
      await deleteForm(formId);
      console.log("Deleted form: ", formId);
      router.replace(`/dashboard/form/admin`);
    } catch (error) {
      console.error("Failed to delete form");
    }
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

      <div className="flex items-center justify-between pb-2">
        <div className="flex justify-start gap-2 px-8 pb-2">
          <Link href="/dashboard/form/admin">
            <Button variant="outline" className="hover:border-gray-50">
              <ChevronLeft />
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
            onClick={handleSaveDraft}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save
          </Button>
          <Button
            onClick={handlePublishDraft}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="mx-8 pb-4">
        <FormHeaderEdit
          title={state.title}
          description={state.description}
          onTitleChange={(e) =>
            dispatch({
              type: "UPDATE_TITLE",
              payload: e.target.value,
            })
          }
          onDescriptionChange={(e) =>
            dispatch({
              type: "UPDATE_DESCRIPTION",
              payload: e.target.value,
            })
          }
        />

        <div className="py-4 space-y-4">
          {state.elements.map((element) => (
            <FormElement
              key={element.element_id}
              element={element}
              onUpdate={(element_id, updatedData) =>
                dispatch({
                  type: "UPDATE_ELEMENT",
                  payload: { element_id, updatedData },
                })
              }
              onRemove={(element_id) =>
                dispatch({
                  type: "REMOVE_ELEMENT",
                  payload: element_id,
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center">
        <FormElementBar
          onAddElement={(type) =>
            dispatch({ type: "ADD_ELEMENT", payload: type })
          }
        />
      </div>
    </>
  );
}

function FormLoadingSkeleton() {
  return (
    <div className="px-8 py-4">
      <h1 className="text-2xl font-semibold tracking-tight py-2">
        <Skeleton className="h-6 w-48" />
      </h1>
      <Skeleton className="h-4 w-80 text-sm text-muted-foreground" />

      <div className="py-4">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      <div className="py-4 space-y-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
