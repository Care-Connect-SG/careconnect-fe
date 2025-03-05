"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BE_API_URL}/users/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data);
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

  return (
    <div className="pt-16 p-8 max-w-4xl mx-auto">
      {/* Top Section - Profile Header */}
      <Card className="p-6 shadow-md bg-white rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/users/edit/${user.email}`)}
          className="bg-gray-800 hover:bg-gray-500"
        >
          Edit Profile
        </Button>
      </Card>

      {/* Bottom Section - User Details */}
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
          <p className="text-gray-700 col-span-2">
            <strong>Created At:</strong>{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </Card>

     
     
    </div>
  );
};

export default UserProfile;
