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
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AddUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const groupId = pathname.split("/")[3];
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchNurses() {
      try {
        const nurses = await getAllNurses();
        setUsers(nurses);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "An error occurred while fetching nurses",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchNurses();
  }, [toast]);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAdding(true);
    try {
      await addUserToGroup({ group_id: groupId, user_id: selectedUser.id });
      toast({
        title: `Successfully added ${selectedUser.name}`,
        description: "User has been added to the group",
      });
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add user",
        description: error.message || "Please try again",
      });
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
      {!loading && (
        <form
          onSubmit={handleAddUser}
          className="space-y-6 bg-white p-6 border rounded-lg shadow-sm"
        >
          <div>
            <Label className="block font-medium mb-2">Select User</Label>
            <Select
              value={selectedUser?.id || ""}
              onValueChange={(value: string) => {
                const user = users.find((u) => u.id === value) || null;
                setSelectedUser(user);
              }}
            >
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
          <div className="flex gap-4 justify-center">
            <Button type="submit" disabled={adding}>
              {adding ? <Spinner /> : "Add User"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
