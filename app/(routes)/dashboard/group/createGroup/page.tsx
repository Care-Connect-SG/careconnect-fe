"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface User {
  id: string; // Use the user id
  email: string;
  name: string;
  role: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  // Store user ids in selectedMembers.
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available users for selection.
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
        setLoadingUsers(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load users");
        setLoadingUsers(false);
      });
  }, []);

  // Single-select handler: add the selected user id if not already added.
  const handleSelectChange = (value: string) => {
    if (!selectedMembers.includes(value)) {
      setSelectedMembers((prev) => [...prev, value]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.filter((memberId) => memberId !== userId),
    );
  };

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          members: selectedMembers, // Now these are user IDs.
        }),
      });
      if (!res.ok) {
        throw new Error(`Error creating group: ${res.statusText}`);
      }
      await res.json();

      toast({
        title: "Group Created",
        description: "Group created successfully!",
        variant: "default",
      });

      router.push("/dashboard/group");
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Group</h1>
      <form
        onSubmit={handleCreateGroup}
        className="space-y-4 bg-white p-6 border rounded-lg shadow-sm"
      >
        <div>
          <label htmlFor="groupName" className="block font-medium mb-1">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="groupDescription" className="block font-medium mb-1">
            Description
          </label>
          <textarea
            id="groupDescription"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Add Members</label>
          {loadingUsers ? (
            <Spinner />
          ) : (
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user to add" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(
                    (user: User) =>
                      user.role === "Admin" || user.role === "Nurse",
                  )
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
          {/* Display selected members with names */}
          {selectedMembers.length > 0 && (
            <ul className="mt-2">
              {selectedMembers.map((userId) => {
                // Find the user from the users list by id.
                const user = users.find((u) => u.id === userId);
                return (
                  <li key={userId} className="flex items-center">
                    <span>{user ? user.name : userId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(userId)}
                      className="ml-2 text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </main>
  );
}
