"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EyeIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import RoleChip from "@/components/ui/roleChip"; 
import CreateUserModal from "@/components/createUserModal"; 
// Define the User interface
interface User {
  email: string;
  name: string;
  contact_number?: string;
  role: string;
  organisation_rank?: string;
  gender: string;
  created_at: string;
}

const Nurses = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("All Users");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Define the modal state
  const router = useRouter();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/users`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  // Filter users based on search query and filter selection
  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filter !== "All Users") {
      filtered = filtered.filter((user) => user.role === filter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filter, users]);

  // Loading state while fetching users
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Users</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-60 p-3 border rounded-lg shadow-sm bg-white text-gray-700">
            <SelectValue placeholder="Filter Users" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg rounded-lg">
            <SelectItem value="All Users">All Users</SelectItem>
            <SelectItem value="Admin">Admins</SelectItem>
            <SelectItem value="Nurse">Nurses</SelectItem>
            <SelectItem value="Family">Family</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md p-3 border rounded-lg shadow-sm bg-white text-gray-700"
        />
      </div>

      <Card className="overflow-hidden rounded-lg shadow-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Contact Number</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Organisation Rank</th>
              <th className="p-4 text-left">Gender</th>

              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.email}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition`}
              >
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.contact_number || "N/A"}</td>
                <td className="p-4">
                  <RoleChip role={user.role} />
                </td>
                <td className="p-4">{user.organisation_rank || "N/A"}</td>
                <td className="p-4">{user.gender}</td>

                <td className="p-4">
                  <EyeIcon
                    className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800 transition"
                    onClick={() =>
                      router.push(`/dashboard/users/${user.email}`)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Button to open modal */}
      <Button
        className="fixed bottom-8 right-8 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
        onClick={() => setIsModalOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      {/* Create User Modal */}
      {isModalOpen && (
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserCreated={fetchUsers}
        />
      )}
    </div>
  );
};

export default Nurses;
