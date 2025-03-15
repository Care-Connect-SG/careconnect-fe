"use client";

import { getUserById, updateUser } from "@/app/api/user";
import { getUser } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { UserEdit } from "@/types/user";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<UserEdit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<UserEdit | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getUserById(id as string);
        setUser(data);
        setEditedUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getUser();
    }
  }, [id]);

  useEffect(() => {
    const getUserRole = async () => {
      if (!session?.user?.email) return;

      const user = await getUser(session.user.email);
      setUserRole(user.role);
    };

    getUserRole();
  }, [session?.user?.email]);

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
    setEditedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editedUser) return;

    try {
      const updatedUser = await updateUser(id as string, editedUser);
      setUser(updatedUser);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <Card className="p-6 shadow-md bg-white rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.role}</p>
        </div>
        {userRole === "Admin" && (
          <Button
            onClick={handleEditProfile}
            className="bg-blue-600 hover:bg-blue-800 text-white"
          >
            Edit Profile
          </Button>
        )}
      </Card>

      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <Button
              variant="transparentHover"
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`py-2 px-1 text-sm font-medium bg-transparent ${
                activeTab === tab.value
                  ? "text-blue-600 border-b-2"
                  : "text-gray-500 border-transparent"
              } hover:text-gray-600 hover:border-gray-600 transition-colors bg-transparent duration-200`}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Name
                </Label>
                <Input
                  type="text"
                  value={editedUser?.name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser!, name: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  value={editedUser?.email || ""}
                  disabled
                  className="w-full mt-1"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Contact Number
                </Label>
                <Input
                  value={editedUser?.contact_number || ""}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser!,
                      contact_number: e.target.value,
                    })
                  }
                  className="w-full mt-1"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Organisation Rank
                </Label>
                <Input
                  value={editedUser?.organisation_rank || ""}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser!,
                      organisation_rank: e.target.value,
                    })
                  }
                  className="w-full mt-1"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Gender
                </Label>
                <Input
                  value={editedUser?.gender || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser!, gender: e.target.value })
                  }
                  className="w-full mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                className="bg-blue-600 hover:bg-blue-800"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
