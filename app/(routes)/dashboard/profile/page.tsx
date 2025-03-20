"use client";

import { getCurrentUser, updateUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { User, UserEdit } from "@/types/user";
import { useEffect, useState } from "react";
import EditProfileDialog from "./_components/edit-profile-dialog";

const MyProfile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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
    setIsDialogOpen(true);
  };

  const handleSave = async (updatedData: UserEdit) => {
    try {
      const updatedUser = await updateUser(user.id, updatedData);
      setUser(updatedUser);
      setIsDialogOpen(false);
      toast({
        title: "Profile updated successfully!",
        description: "Your profile has been updated successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <Card className="p-6 shadow-md bg-white rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.role}</p>
        </div>
        <Button
          onClick={handleEditProfile}
          className="bg-blue-600 hover:bg-blue-800 text-white"
        >
          Edit Profile
        </Button>
      </Card>
      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <Button
              variant="transparentHover"
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === tab.value
                  ? "text-blue-600 border-b-2"
                  : "text-gray-500 border-transparent"
              } hover:text-gray-600 hover:border-gray-600 transition-colors duration-200`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      {activeTab === "overview" && (
        <Card className="p-6 shadow-md bg-white rounded-lg mt-6">
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
      )}
      {activeTab === "history" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">User History</h2>
          {/* Insert user history content here */}
        </div>
      )}
      {activeTab === "permissions" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">User Permissions</h2>
          {/* Insert permissions content here */}
        </div>
      )}
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
