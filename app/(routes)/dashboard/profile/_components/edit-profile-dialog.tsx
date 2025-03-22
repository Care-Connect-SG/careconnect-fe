"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserEdit } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(4, "Name has to be at least 4 characters long"),
  contact_number: z.string().optional(),
  organisation_rank: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const mapUserEditToProfileFormValues = (data: UserEdit): ProfileFormValues => ({
  name: data.name,
  contact_number: data.contact_number || "",
  organisation_rank: data.organisation_rank || "",
  gender:
    data.gender === "Male" || data.gender === "Female" ? data.gender : "Male",
});

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: User;
  onSave: (data: UserEdit) => void;
}

const EditProfileDialog = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}: EditProfileDialogProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: mapUserEditToProfileFormValues(initialData),
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(mapUserEditToProfileFormValues(initialData));
  }, [initialData, form]);

  const currentValues = useWatch({ control: form.control });

  const isSaveDisabled = useMemo(() => {
    const initialValues = mapUserEditToProfileFormValues(initialData);
    return (
      !form.formState.isValid ||
      JSON.stringify(currentValues) === JSON.stringify(initialValues)
    );
  }, [currentValues, initialData, form.formState.isValid]);

  const handleSubmit = async (data: ProfileFormValues) => {
    onSave({ ...initialData, ...data });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Modify your profile information</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <div className="space-y-4">
            <div>
              <FormLabel>Email</FormLabel>
              <Input
                value={initialData.email}
                disabled
                className="mt-1 block w-full"
              />
            </div>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organisation_rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation Rank</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-800"
                  disabled={isSaveDisabled}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
