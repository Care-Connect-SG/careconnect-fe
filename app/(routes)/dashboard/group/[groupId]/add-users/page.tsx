"use client";

import { addUserToGroup } from "@/app/api/group";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { User } from "@/types/user";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AddUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const groupId = pathname.split("/")[3];
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNurses() {
      try {
        const nurses = await getAllNurses();
        setUsers(nurses);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching nurses");
        setLoading(false);
      }
    }
    fetchNurses();
  }, []);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      await addUserToGroup({ group_id: groupId, user_id: selectedUser });
      setAddSuccess("User added successfully!");
      setSelectedUser("");
    } catch (error: any) {
      setAddError(error.message || "Error adding user");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="secondary" onClick={() => router.back()}>
          Back
        </Button>
        <h1 className="text-3xl font-bold text-center flex-1">
          Add User to Group
        </h1>
        <div className="w-24" />
      </div>
      {loading && <Spinner />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && (
        <form
          onSubmit={handleAddUser}
          className="space-y-6 bg-white p-6 border rounded-lg shadow-sm"
        >
          <div>
            <Label className="block font-medium mb-2">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user to add" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
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
    </div>
  );
}
