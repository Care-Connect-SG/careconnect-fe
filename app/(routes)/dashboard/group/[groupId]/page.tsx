"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface Group {
  _id: string; // from the backend
  name: string;
  description: string;
  members?: string[];
}

export default function ViewGroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups and find the group with the matching groupId.
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch groups");
        }
        return res.json();
      })
      .then((data) => {
        // Find group using _id (or fallback to id)
        const found = data.find((g: any) => g._id === groupId || g.id === groupId);
        if (!found) {
          setError("Group not found");
        } else {
          setGroup(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "An error occurred while fetching groups");
        setLoading(false);
      });
  }, [groupId]);

  if (loading) return <Spinner />;
  if (error || !group) return <p className="text-red-500">{error || "Group not found"}</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard/group"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back
        </Link>
        <Link
          href={`/dashboard/group/${groupId}/edit`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </Link>
      </header>

      {/* Group Details */}
      <section className="mb-8">
        <h1 className="text-4xl font-bold">{group.name}</h1>
        <p className="mt-2 text-gray-700">{group.description}</p>
      </section>

      {/* Members Section */}
      <section className="bg-white p-6 border rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Members</h2>
          <Link
            href={`/dashboard/group/${groupId}/add-users`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Users
          </Link>
        </div>
        {group.members && group.members.length > 0 ? (
          <ul className="space-y-2">
            {group.members.map((member, index) => (
              <li key={index} className="text-gray-700">
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No members yet.</p>
        )}
      </section>
    </main>
  );
}