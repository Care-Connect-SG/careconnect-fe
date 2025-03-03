"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string; // new: store user id
  email: string;
  name: string;
  role: string; // Role property to filter Admin or Nurse
}

export default function AddUsersPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

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
          user_id: selectedUser, // Now using user_id instead of user_email.
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.detail || "Failed to add user to group");
      }
      await res.json();
      setAddSuccess(`User added successfully!`);
      setSelectedUser("");
    } catch (error: any) {
      setAddError(error.message || "Error adding user");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Header with back button on the left, centered title */}
      <header className="mb-8 flex items-center justify-between">
        <Button variant="secondary" onClick={() => router.back()}>
          Back
        </Button>
        <h1 className="text-3xl font-bold text-center flex-1">
          Add User to Group
        </h1>
        <div className="w-24" />
      </header>

      {loading && <Spinner />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && (
        <form
          onSubmit={handleAddUser}
          className="space-y-6 bg-white p-6 border rounded-lg shadow-sm"
        >
          <div>
            <label className="block font-medium mb-2">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user to add" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(
                    (user: User) =>
                      user.role === "Admin" || user.role === "Nurse"
                  )
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {addError && <p className="text-red-500">{addError}</p>}
          {addSuccess && <p className="text-green-500">{addSuccess}</p>}
          <div className="flex gap-4 justify-center">
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
