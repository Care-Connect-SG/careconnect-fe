"use client";

import { getCurrentUser, updateUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, UserEdit } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import EditProfileDialog from "./_components/edit-profile-dialog";
import ProfilePictureDialog from "./_components/profile-picture-dialog";

const MyProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

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
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }
  if (error || !user) {
    return <p className="text-center mt-10 text-red-500">User not found</p>;
  }

  const TABS = [
    { value: "overview", label: "Overview" },
    { value: "history", label: "History" },
    { value: "permissions", label: "Permissions" },
  ];

  const handleEditProfile = () => setIsDialogOpen(true);
  const handleSave = (updatedData: UserEdit) => {
    updateUserMutation.mutate(updatedData);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full p-8">
      <Card className="p-6  bg-white rounded-lg flex items-center justify-between">
        <div className="flex flex-row space-x-4 items-center">
          <ProfilePictureDialog user={user} />
          <div className="flex flex-col space-y-2 items-start justify-center">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </div>
        <Button onClick={handleEditProfile} variant="outline">
          Edit Profile
        </Button>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full mt-6"
      >
        <TabsList className="mb-6">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6  bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-gray-700">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-gray-700">
                <strong>Contact:</strong> {user.contact_number || "N/A"}
              </p>
              <p className="text-gray-700">
                <strong>Organisation Rank:</strong>{" "}
                {user.organisation_rank || "N/A"}
              </p>
              <p className="text-gray-700">
                <strong>Gender:</strong> {user.gender}
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6 shadow-md bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User History</h2>
            <p className="text-gray-500">No history records available.</p>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card className="p-6 shadow-md bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Permissions</h2>
            <p className="text-gray-500">No permission settings available.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProfileDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={user}
        onSave={handleSave}
      />
    </div>
  );
};

export default MyProfile;
