"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { XIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  email: string;
  name: string;
  contact_number?: string;
  role: string;
  organisation_rank?: string;
  gender: string;
  created_at: string;
}

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BE_API_URL}/users/${id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setEditedUser(data); // Set the initial edit state
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

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

  // Handle opening the modal
  const handleEditProfile = () => {
    setEditedUser(user); // Set current user data for editing
    setIsModalOpen(true);
  };

  // Handle saving the changes
  const handleSaveChanges = async () => {
    if (!editedUser) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedUser),
        },
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsModalOpen(false);
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      {/* Profile Card (Always Visible) */}
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

      {/* Tab Bar */}
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

      {/* Tab Content */}
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
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editedUser?.name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser!, name: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  value={editedUser?.email || ""}
                  disabled
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Organisation Rank
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
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
