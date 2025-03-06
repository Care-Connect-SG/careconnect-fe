"use client";

import { getUser } from "@/app/api/user";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Group {
  id: string; // Unique identifier from the backend.
  name: string;
  description: string;
  members?: string[]; // These are user IDs.
}

interface User {
  id: string; // User id.
  email: string;
  name: string;
  role: string;
}

export default function GroupDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/groups"), fetch("/api/users")])
      .then(async ([groupsRes, usersRes]) => {
        if (!groupsRes.ok) {
          throw new Error("Failed to fetch groups");
        }
        if (!usersRes.ok) {
          throw new Error("Failed to fetch users");
        }
        const groupsData = await groupsRes.json();
        const usersData: User[] = await usersRes.json();
        setGroups(groupsData);
        setUsers(usersData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "An error occurred while fetching data");
        setLoading(false);
      });
  }, []);

  // Helper function to get a user's name from the users array by id.
  const getUserName = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }

      try {
        const user = await getUser(session.user.email);
        setIsAdmin(user?.role === "Admin"); // ✅ Update state
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.email]);

  // Filter groups based on group name or any member's name.
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
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <div className="flex flex-1 items-center gap-4">
          <input
            type="text"
            placeholder="Search by group or user's name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          {isAdmin && (
            <Link
              href="/dashboard/group/createGroup"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Group</span>
            </Link>
          )}
        </div>
      </header>

      {loading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const groupIdentifier = group.id;
            // Convert each member's id to their corresponding name.
            const memberNames =
              group.members && group.members.length > 0
                ? group.members.map((id) => getUserName(id)).join(", ")
                : "No members yet.";

            return (
              <div
                key={groupIdentifier}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/dashboard/group/${groupIdentifier}`}>
                  <div className="cursor-pointer">
                    <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
                    <p className="text-gray-700 mb-2">{group.description}</p>
                    {/* Use truncate for single-line or line-clamp-2 for two lines */}
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
    </main>
  );
}
