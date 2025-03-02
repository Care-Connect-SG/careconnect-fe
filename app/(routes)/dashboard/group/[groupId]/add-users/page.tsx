"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface User {
  email: string;
  name: string;
  role: string; // Role property to filter Admin or Nurse
}

export default function AddUsersPage() {
  const { groupId } = useParams();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Fetch all users dynamically from the backend.
  useEffect(() => {
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "An error occurred while fetching users");
        setLoading(false);
      });
  }, []);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const res = await fetch("/api/groups/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: groupId, // Using the stable group identifier from the URL.
          user_email: selectedUser,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.detail || "Failed to add user to group");
      }
      await res.json();
      setAddSuccess(`User ${selectedUser} added successfully!`);
      setSelectedUser("");
    } catch (error: any) {
      setAddError(error.message || "Error adding user");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add User to Group</h1>
      {loading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <form
          onSubmit={handleAddUser}
          className="space-y-4 bg-white p-6 border rounded-lg shadow-sm"
        >
          <div>
            <label className="block font-medium mb-2">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(
                    (user: User) =>
                      user.role === "Admin" || user.role === "Nurse"
                  )
                  .map((user) => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {addError && <p className="text-red-500">{addError}</p>}
          {addSuccess && <p className="text-green-500">{addSuccess}</p>}
          <div className="flex gap-4">
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add User"}
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Back to Edit Group
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
