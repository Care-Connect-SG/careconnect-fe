import { getFormById } from "@/app/api/form";
import { notFound } from "next/navigation";
import FormSubmit from "../../_components/form-submit";


export default async function FillForm({ params }: { params: Promise<{ id: string }> }) {
  const formId = (await params).id;
  const form = await getFormById(formId);

  if (!form) notFound();

  return <FormSubmit form={form} />
}
