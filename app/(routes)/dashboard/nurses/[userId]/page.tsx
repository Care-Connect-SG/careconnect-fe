"use client";

import { getUserById, updateUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useToast } from "@/hooks/use-toast";
import { User, UserEdit } from "@/types/user";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditProfileDialog from "../../profile/_components/edit-profile-dialog";

const UserProfile = () => {
  const { toast } = useToast();
  const { setPageName } = useBreadcrumb();
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getUserById(userId as string);
        setUser(data);
        setPageName(data?.name || `${userId} User Profile`);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      getUser();
    }
  }, [userId, setPageName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-500">User not found</p>;
  }

  const TABS = [
    { value: "overview", label: "Overview" },
    { value: "history", label: "History" },
    { value: "permissions", label: "Permissions" },
  ];

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (editedUser: UserEdit) => {
    try {
      const updatedUser = await updateUser(userId as string, editedUser);
      setUser(updatedUser);
      setIsModalOpen(false);
      toast({
        title: "Profile updated successfully!",
        description: `${user.name}'s profile has been updated successfully`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Failed to update profile, please try again",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full p-8">
      <Card className="p-6 bg-white rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.role}</p>
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
          <Card className="p-6 bg-white rounded-lg">
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
          <Card className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User History</h2>
            <p className="text-gray-500">No history records available.</p>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Permissions</h2>
            <p className="text-gray-500">No permission settings available.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProfileDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={user}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default UserProfile;
