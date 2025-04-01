"use client";

import { getGroups } from "@/app/api/group";
import { getAllNurses } from "@/app/api/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Search } from "lucide-react";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GroupDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, usersData] = await Promise.all([
          getGroups(),
          getAllNurses(),
        ]);
        setGroups(groupsData);
        setUsers(usersData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching groups:", err.message);
        toast({
          title: "An error occurred while fetching groups",
          description: err.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserName = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  const getUser = (userId: string): User | undefined => {
    return users.find((u) => u.id === userId);
  };

  const currentUser = session?.user?.email
    ? users.find((u) => u.email === session.user.email)
    : null;
  const isAdmin = currentUser?.role === "Admin";

  const filteredGroups = groups.filter((group) => {
    const term = searchTerm.toLowerCase();
    const groupNameMatches = group.name.toLowerCase().includes(term);
    const memberMatches = group.members
      ? group.members.some((memberId) =>
          getUserName(memberId).toLowerCase().includes(term),
        )
      : false;
    return groupNameMatches || memberMatches;
  });

  return (
    <div className="p-8 w-full">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "All Groups" : "My Groups"}
        </h1>
        <div className="flex flex-row items-center gap-4">
          <div className="relative flex-grow w-[400px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by group or user's name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => router.push("/dashboard/groups/createGroup")}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="font-medium">Create New Group</span>
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="p-8">
          <Spinner />
        </div>
      )}
      {!loading && filteredGroups.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-center flex justify-center items-center">
            No groups found at the moment
          </p>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-4">
          {filteredGroups.map((group) => {
            const memberNames =
              group.members && group.members.length > 0
                ? group.members.map((id) => getUserName(id)).join(", ")
                : "No members yet.";

            const groupMembers = group.members
              ? (group.members
                  .map((id) => getUser(id))
                  .filter(Boolean) as User[])
              : [];

            const displayMembers = groupMembers.slice(0, 10);
            const remainingCount = Math.max(0, groupMembers.length - 10);

            return (
              <div
                key={group.id}
                className="bg-white border rounded-lg p-6 hover:bg-blue-50 transition-all ease-in-out hover:duration-300"
              >
                <Link href={`/dashboard/groups/${group.id}`} legacyBehavior>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col space-y-3">
                      <h2 className="text-xl font-semibold">{group.name}</h2>
                      <p className="text-gray-700">{group.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex -space-x-4 rtl:space-x-reverse">
                        {displayMembers.map((member, index) => (
                          <div
                            key={member.id}
                            className="rounded-lg overflow-hidden border-2 border-white"
                            style={{ zIndex: 10 - index }}
                          >
                            <Avatar className="h-10 w-10 rounded-lg">
                              <AvatarImage
                                src={member.profile_picture || undefined}
                                alt={member.name}
                                className="rounded-lg"
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-800 text-sm rounded-lg">
                                {member.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ))}

                        {remainingCount > 0 && (
                          <div
                            className="flex items-center justify-center h-10 w-10 rounded-lg border-2 border-white bg-gray-200 text-gray-800 text-sm font-medium"
                            style={{ zIndex: 0 }}
                          >
                            +{remainingCount}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-500">
                        {groupMembers.length}{" "}
                        {groupMembers.length === 1 ? "member" : "members"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
