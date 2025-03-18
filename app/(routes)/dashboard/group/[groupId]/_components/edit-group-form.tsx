"use client";

import { updateGroup } from "@/app/api/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/group";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const editGroupSchema = z.object({
  newName: z
    .string()
    .min(6, { message: "Group name must be at least 6 characters long" }),
  newDescription: z
    .string()
    .min(12, { message: "Group name must be at least 12 characters long" }),
});

type EditGroupFormValues = z.infer<typeof editGroupSchema>;

interface EditGroupInlineProps {
  group: Group;
  groupId: string;
  onUpdate: (updatedGroup: Group) => void;
}

export function EditGroupForm({
  group,
  groupId,
  onUpdate,
}: EditGroupInlineProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const form = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      newName: group.name,
      newDescription: group.description,
    },
  });

  const {
    reset,
    formState: { isDirty },
  } = form;

  useEffect(() => {
    reset({
      newName: group.name,
      newDescription: group.description,
    });
  }, [group, reset]);

  const handleUpdateGroup = async (values: EditGroupFormValues) => {
    const payload = {
      group_id: groupId,
      new_name: values.newName,
      new_description: values.newDescription,
    };

    setUpdating(true);

    try {
      await updateGroup(payload);
      onUpdate({
        ...group,
        name: values.newName,
        description: values.newDescription,
      });
      toast({
        title: "Group Updated",
        description: "The group details have been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Error updating group",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleUpdateGroup)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="newName"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Group Name"
                    {...field}
                    className="bg-white rounded px-4 py-3 shadow-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newDescription"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Group Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Group Description"
                    {...field}
                    className="bg-white rounded px-4 py-3 shadow-sm"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={updating || !isDirty}
            className="w-full"
          >
            {updating ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
