"use client";

import { getGroups } from "@/app/api/group";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Search } from "lucide-react";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GroupDashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setError(err.message || "An error occurred while fetching data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserName = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Group</h1>
        <div className="flex flex-row items-center gap-4 w-full sm:w-3/5">
          <div className="relative flex-grow">
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
              onClick={() => router.push("/dashboard/group/createGroup")}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Group</span>
            </Button>
          )}
        </div>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const memberNames =
              group.members && group.members.length > 0
                ? group.members.map((id) => getUserName(id)).join(", ")
                : "No members yet.";
            return (
              <div
                key={group.id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/dashboard/group/${group.id}`}>
                  <div className="cursor-pointer">
                    <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
                    <p className="text-gray-700 mb-2">{group.description}</p>
                    <p className="text-sm text-gray-500 truncate">
                      Members: {memberNames}
                    </p>
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
