"use client";

import { createGroup } from "@/app/api/group";
import { getUsers } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function CreateGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoadingUsers(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

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
      await createGroup({
        name: groupName,
        description: groupDescription,
        members: selectedMembers,
      });

      toast({
        title: "Group Created",
        description: "Group created successfully!",
        variant: "default",
      });

      router.push("/dashboard/group");
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Group</h1>
      <form
        onSubmit={handleCreateGroup}
        className="space-y-4 bg-white p-6 border rounded-lg shadow-sm"
      >
        <div>
          <Label htmlFor="groupName" className="block font-medium mb-1">
            Group Name
          </Label>
          <Input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="groupDescription" className="block font-medium mb-1">
            Description
          </Label>
          <Textarea
            id="groupDescription"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            rows={4}
            required
          />
        </div>
        <div>
          <Label className="block font-medium mb-1">Add Members</Label>
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
                const user = users.find((u) => u.id === userId);
                return (
                  <li key={userId} className="flex items-center">
                    <span>{user ? user.name : userId}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveMember(userId)}
                      className="ml-2 text-red-500"
                    >
                      Remove
                    </Button>
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
    </div>
  );
}
