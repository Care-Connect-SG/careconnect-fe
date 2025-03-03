"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

  // Fetch both groups and users concurrently.
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

  // Filter groups based on group name or any member's name.
  const filteredGroups = groups.filter((group) => {
    const term = searchTerm.toLowerCase();
    const groupNameMatches = group.name.toLowerCase().includes(term);
    const memberMatches = group.members
      ? group.members.some((memberId) =>
          getUserName(memberId).toLowerCase().includes(term)
        )
      : false;
    return groupNameMatches || memberMatches;
  });

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Groups</h1>
        <div className="flex flex-1 mx-8 items-center gap-4">
          <input
            type="text"
            placeholder="Search by group or user's name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <Link
            href="/dashboard/group/createGroup"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Group</span>
          </Link>
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
