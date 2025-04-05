"use client";

import { getCurrentUser, updateUser } from "@/app/api/user";
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
import { useToast } from "@/hooks/use-toast";
import { User, UserEdit } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import RoleChip from "../nurses/_components/role-chip";
import ChangePasswordDialog from "./_components/change-password-dialog";
import ProfilePictureDialog from "./_components/profile-picture-dialog";

const profileSchema = z.object({
  name: z.string().min(4, "Name has to be at least 4 characters long"),
  contact_number: z.string().optional(),
  organisation_rank: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const MyProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formInitialized, setFormInitialized] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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
    }
  }, [user, form, formInitialized]);

  const updateUserMutation = useMutation({
    mutationFn: async (updatedData: UserEdit) => {
      return await updateUser(user!.id, updatedData);
    },
    onSuccess: (updatedUser: User) => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile has been updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      console.error("Error updating user:", error);
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ProfileFormValues) => {
    if (user) {
      updateUserMutation.mutate({ ...user, ...data });
    }
  };

  const handlePasswordDialogOpen = () => setIsPasswordDialogOpen(true);
  const handlePasswordDialogClose = () => setIsPasswordDialogOpen(false);

  if (isLoading || (!formInitialized && user)) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner />
      </div>
    );
  }

  if (error || !user) {
    return <p className="text-center mt-10 text-red-500">User not found</p>;
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col space-y-8 ">
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <ProfilePictureDialog user={user} />
              <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <RoleChip role={user.role} />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handlePasswordDialogOpen}
            >
              Change Password
            </Button>
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

              <div className="flex justify-end">
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
              </div>
            </form>
          </FormProvider>

          {user && (
            <ChangePasswordDialog
              isOpen={isPasswordDialogOpen}
              onClose={handlePasswordDialogClose}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
