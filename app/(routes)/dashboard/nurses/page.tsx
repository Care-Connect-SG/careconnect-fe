"use client";

import { deleteUser } from "@/app/api/user";
import CreateUserModal from "@/components/createUserModal";
import { Button } from "@/components/ui/button";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";
import { Input } from "@/components/ui/input";
import RoleChip from "@/components/ui/roleChip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { User } from "@/types/user";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Nurses = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("All Users");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/users`,
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

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        fetchUsers(); // Refresh the user list
        setIsConfirmationModalOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (filter !== "All Users") {
      filtered = filtered.filter((user) => user.role === filter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filter, users]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Management</h1>

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

      <div className="flex mx-auto">
        <table className="w-full max-w-5xl border-collapse shadow-lg rounded-lg overflow-hidden">
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
                key={user.id}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition cursor-pointer`}
                onClick={() => router.push(`/dashboard/nurses/${user.id}`)}
              >
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.contact_number || "N/A"}</td>
                <td className="p-4">
                  <RoleChip role={user.role} />
                </td>
                <td className="p-4">{user.organisation_rank || "N/A"}</td>
                <td className="p-4">{user.gender}</td>
                <td className="p-4 flex gap-3">
                  <TrashIcon
                    className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800 transition"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      setUserToDelete(user); // Set the user to be deleted
                      setIsConfirmationModalOpen(true); // Open the confirmation modal
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        className="fixed bottom-8 right-8 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
        onClick={() => setIsModalOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      {isModalOpen && (
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserCreated={fetchUsers}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default Nurses;
