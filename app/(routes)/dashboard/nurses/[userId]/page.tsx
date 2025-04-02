"use client";

import { getUserById, updateUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useToast } from "@/hooks/use-toast";
import { UserEdit } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import ProfilePictureDialog from "../../profile/_components/profile-picture-dialog";
import RoleChip from "../_components/role-chip";

const nurseProfileSchema = z.object({
  name: z.string().min(4, "Name has to be at least 4 characters long"),
  contact_number: z.string().optional(),
  organisation_rank: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
});

type NurseProfileFormValues = z.infer<typeof nurseProfileSchema>;

const SimplifiedNurseProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useParams();
  const { setPageName } = useBreadcrumb();
  const [formInitialized, setFormInitialized] = useState(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId as string),
  });

  const form = useForm<NurseProfileFormValues>({
    resolver: zodResolver(nurseProfileSchema),
    mode: "onChange",
    defaultValues: formInitialized
      ? {
          name: user?.name || "",
          contact_number: user?.contact_number || "",
          organisation_rank: user?.organisation_rank || "",
          gender: user?.gender === "Female" ? "Female" : "Male",
        }
      : undefined,
  });

  useEffect(() => {
    if (user && !formInitialized) {
      const gender = user.gender === "Female" ? "Female" : "Male";

      form.reset({
        name: user.name || "",
        contact_number: user.contact_number || "",
        organisation_rank: user.organisation_rank || "",
        gender: gender,
      });

      setFormInitialized(true);
      setPageName(user.name || "User Profile");
    }
  }, [user, form, formInitialized, setPageName]);

  const updateUserMutation = useMutation({
    mutationFn: (updatedData: UserEdit) =>
      updateUser(userId as string, updatedData),
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile updated successfully",
        description: `${updatedUser.name}'s profile has been updated successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (error: any) => {
      console.error("Error updating user:", error);
      toast({
        title: "Failed to update profile, please try again",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: NurseProfileFormValues) => {
    if (user) {
      updateUserMutation.mutate({ ...user, ...data });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-center text-red-500">User not found</p>
      </div>
    );
  }

  if (!formInitialized) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center space-x-4">
            <ProfilePictureDialog user={user} />
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <RoleChip role={user.role} />
            </div>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={user.email} disabled className="bg-gray-50" />
              </div>

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

              <Button
                type="submit"
                className="w-32"
                disabled={
                  !form.formState.isDirty ||
                  !form.formState.isValid ||
                  updateUserMutation.isPending
                }
              >
                {updateUserMutation.isPending ? <Spinner /> : "Save Changes"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedNurseProfile;
