"use client";

import {
  deleteGroup,
  getGroupById,
  removeUserFromGroup,
} from "@/app/api/group";
import { getAllNurses } from "@/app/api/user";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditGroupForm } from "./_components/edit-group-form";
import { SelectAddUser } from "./_components/select-add-user";

export default function ViewGroupPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const groupId = pathname.split("/")[3];
  const router = useRouter();
  const { toast } = useToast();
  const { setPageName } = useBreadcrumb();

  const [group, setGroup] = useState<Group | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = session?.user?.email
    ? users.find((u) => u.email === session.user.email)
    : null;
  const isAdmin = currentUser?.role === "Admin";

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await getGroupById(groupId);
        setGroup(data);
        setPageName(data.name);
      } catch (err: any) {
        console.error("Error fetching group:", err.message);
        toast({
          title: "An error occurred while fetching group",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, setPageName]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllNurses();
        setUsers(data);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
          title: "An error occurred while fetching users",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, []);

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const handleDeleteGroup = async () => {
    if (!group) return;

    try {
      await deleteGroup(groupId);
      toast({
        title: "Group Deleted Successfully",
        description: `Group ${group.name} has been successfully deleted`,
      });
      router.push("/dashboard/groups");
    } catch (err: any) {
      console.error("Error deleting group:", err.message);
      toast({
        title: "An error occurred while deleting group, please try again",
        description: err.message,
        variant: "destructive",
      });
    }
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
        title: "User removed successfully",
        description: `Successfully removed ${user.name} from group`,
      });
    } catch (err: any) {
      console.error("Error removing user:", err.message);
      toast({
        title:
          "An error occurred while removing user from group, please try again",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleUserAdded = (user: User) => {
    if (group) {
      setGroup({
        ...group,
        members: [...group.members, user.id],
      });
    }
  };

  if (loading) return <Spinner />;
  if (!group)
    return (
      <div className="flex items-center justify-center h-full flex-col space-y-6">
        <p className="text-2xl text-center">Group page not found</p>
        <Button onClick={() => router.push("/dashboard/groups")}>
          Return to groups
        </Button>
      </div>
    );

  const availableUsers = users.filter(
    (user) => !group.members.includes(user.id),
  );

  return (
    <div className="p-8 gap-8 w-full flex flex-col">
      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="text-2xl font-bold">{group.name} Group's Details</h1>
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={"outline"}
                className="text-red-500 bg-transparent hover:text-red-500"
              >
                <Trash className="w-5 h-5" />
                Delete Group
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  group and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={handleDeleteGroup}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        <EditGroupForm
          group={group}
          groupId={groupId}
          onUpdate={(updatedGroup) => setGroup(updatedGroup)}
          isAdmin={isAdmin}
        />

        <div className="flex-1 space-y-5">
          <Label className="block text-sm font-medium text-gray-600">
            <span className="text-black rounded-full bg-blue-100 font-semibold mr-1.5 w-full px-2 py-0.5">
              {group.members.length}
            </span>
            members in this group
          </Label>
          <div>
            {isAdmin && (
              <SelectAddUser
                groupId={groupId}
                availableUsers={availableUsers}
                onUserAdded={handleUserAdded}
              />
            )}

            <div className="space-y-4 mt-4">
              {group.members.map((memberId) => {
                const user = getUserById(memberId);
                if (!user) return null;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between "
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.profile_picture || undefined}
                          alt={user.name}
                          className="rounded-lg bg-blue-100"
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-sm rounded-lg">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-800 font-medium">
                        {user.name}
                      </span>
                    </div>
                    {isAdmin && (
                      <Button
                        onClick={() => handleRemoveUser(user.id)}
                        variant="ghost"
                        className="text-red-500 text-sm hover:underline hover:text-red-500"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
