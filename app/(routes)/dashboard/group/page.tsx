"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Group {
  id: string; // using 'id' to represent the unique identifier from the backend
  name: string;
  description: string;
  members?: string[]; // these are user IDs
}

interface User {
  id: string; // user id used for mapping
  email: string;
  name: string;
  role: string;
}

export default function GroupDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userMapping, setUserMapping] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both groups and users concurrently.
  useEffect(() => {
    Promise.all([
      fetch("/api/groups"),
      fetch("/api/users")
    ])
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
        // Build a mapping: user id => name.
        const mapping: { [id: string]: string } = {};
        usersData.forEach((user) => {
          mapping[user.id] = user.name;
        });
        setUserMapping(mapping);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "An error occurred while fetching data");
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header with title and Create New Group button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Groups</h1>
        <Link
          href="/dashboard/group/createGroup"
          className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Group</span>
        </Link>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const groupIdentifier = group.id || "";
            // Convert each member's id to their corresponding name.
            const memberNames = group.members && group.members.length > 0
              ? group.members.map(id => userMapping[id] || id).join(", ")
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
                    <p className="text-sm text-gray-500">
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
