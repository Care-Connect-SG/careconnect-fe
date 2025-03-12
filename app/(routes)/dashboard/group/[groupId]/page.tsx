"use client";

import { getGroups } from "@/app/api/group";
import { removeUserFromGroup } from "@/app/api/group";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewGroupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const groupId = pathname.split("/")[3];
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await getGroups();
        const found = data.find((g: any) => g.id === groupId);
        if (!found) {
          setError("Group not found");
        } else {
          setGroup(found);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllNurses();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (group && group.members.length > 0) {
      fetchUsers();
    }
  }, [group]);

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const handleRemoveUser = async (userId: string) => {
    const user = getUserById(userId);
    if (!user) return;

    try {
      await removeUserFromGroup(groupId, userId);
      setGroup((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m !== userId) }
          : prev,
      );
      toast({
        title: "User Removed",
        description: `${user.name} has been successfully removed from the group.`,
      });
    } catch (err: any) {
      console.error("Error removing user:", err.message || err);
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Spinner />;
  if (error || !group)
    return (
      <p className="text-red-500 text-center p-4">
        {error || "Group not found"}
      </p>
    );

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <header className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard/group")}
          >
            &lt; Back
          </Button>
          <h1 className="text-3xl font-bold flex-1 text-center">
            Group Details
          </h1>
          <Link
            href={`/dashboard/group/${groupId}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit
          </Link>
        </header>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-5">
        <div className="space-y-3">
          <div>
            <Label className="block text-sm font-medium text-gray-600">
              Group Name
            </Label>
            <div className="mt-1 bg-white rounded px-3 py-2 shadow-sm">
              {group.name}
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-600">
              Group Description
            </Label>
            <div className="mt-1 bg-white rounded px-3 py-2 shadow-sm">
              {group.description}
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/group/${groupId}/add-users`}
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Users</span>
        </Link>

        <div className="mt-20">
          <h2 className="text-sm font-medium text-gray-600 mb-2">
            Current Users
          </h2>
          <div className="space-y-2">
            {group.members.length === 0 ? (
              <p className="text-gray-500">No users yet.</p>
            ) : (
              group.members.map((memberId) => {
                const user = getUserById(memberId);
                if (!user) return null;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-white rounded px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <span className="text-gray-700 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <span className="text-gray-800 font-medium">
                        {user.name}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
