"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface Group {
  id: string; // using 'id' to represent the unique identifier from the backend
  name: string;
  description: string;
  members?: string[];
}

export default function GroupDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups from the API endpoint when the component mounts.
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch groups");
        }
        return res.json();
      })
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "An error occurred while fetching groups");
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Groups</h1>
      <div className="mb-6">
      <Link
  href="/dashboard/group/createGroup"
  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
>
  Create New Group
</Link>

      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => {
            const groupIdentifier = group.id ? String(group.id) : index.toString();
            return (
              <div key={groupIdentifier} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/dashboard/group/${groupIdentifier}`}>
                  <div className="cursor-pointer">
                    <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
                    <p className="text-gray-700 mb-2">{group.description}</p>
                    {group.members && (
                      <p className="text-sm text-gray-500">
                        Members: {group.members.join(", ")}
                      </p>
                    )}
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
