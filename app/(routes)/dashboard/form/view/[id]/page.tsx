import { getFormById } from "@/app/api/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormComplete } from "@/types/form";
import { ChevronLeft, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormElementView from "../../_components/form-element-view";
import { FormHeaderView } from "../../_components/form-header";

export default async function ViewForm({
  params,
}: { params: Promise<{ id: string }> }) {
  const formId = (await params).id;
  let form: FormComplete | null = null;

  try {
    form = await getFormById(formId);
    if (!form) notFound();
    //TODO: Find a better way to handle errors
  } catch (error) {
    notFound();
    //TODO: Find a better way to handle errors
  }

  return (
    <div className="py-4 px-8">
      <div className="flex justify-between pb-2">
        <div className="flex justify-start gap-2">
          <Link href="/dashboard/form">
            <button className="border h-6 w-10 rounded-md hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4 mx-auto" />
            </button>
          </Link>
        </div>
        <div className="flex items-end">
          <Badge
            className={
              form.status === "Draft"
                ? "text-yellow-800 bg-yellow-100 h-6"
                : "text-green-800 bg-green-100 h-6"
            }
          >
            {form.status}
          </Badge>
          <Badge className="h-6 ml-2 bg-blue-100 text-blue-600">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Badge>
        </div>
      </div>

      <div>
        <FormHeaderView title={form.title} description={form.description} />
        <div className="py-4 space-y-4">
          {form.json_content.map((element) => (
            <FormElementView key={element.id} element={element} />
          ))}
        </div>
      </div>

      <Button disabled className="disabled:opacity-100">
        Submit Form
      </Button>
    </div>
  );
}
