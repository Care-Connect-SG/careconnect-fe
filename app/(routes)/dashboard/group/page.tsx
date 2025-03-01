"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
//import { AppSidebar } from "@/components/app-sidebar";
//import { TopBar } from "@/components/ui/topbar";
import { Spinner } from "@/components/ui/spinner";

interface Group {
    _id: string; // Now required, since your backend always returns _id
    name: string;
    description: string;
    members?: string[];
  }

export default function GroupDashboard() {
const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // useEffect to fetch groups from your API endpoint when the component mounts.
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

  // Function to handle group creation
  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If you need authentication headers, add them here.
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          // If your backend expects members or other fields, include them as needed.
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating group: ${response.statusText}`);
      }
      const createdGroup = await response.json();

      // Append the new group to the list
      setGroups((prev) => [...prev, createdGroup]);
      // Reset form fields
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (err: any) {
      setCreateError(err.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="p-6">
          <h1 className="text-3xl font-bold mb-4">Groups</h1>

          {/* Form for creating a new group */}
      <form onSubmit={handleCreateGroup} className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create New Group</h2>
        {createError && <p className="text-red-500 mb-2">{createError}</p>}
        <div className="mb-2">
          <label htmlFor="groupName" className="block font-medium">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-2">
          <label htmlFor="groupDescription" className="block font-medium">
            Description
          </label>
          <textarea
            id="groupDescription"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Group"}
        </button>
      </form>

          {/* Loading spinner */}
          {loading && <Spinner />}

          {/* Error message */}
          {error && <p className="text-red-500">{error}</p>}

          {/* Groups list */}
          {!loading && !error && (
            <ul className="space-y-4">
            {groups.map((group, index) => {
              // Use group.group_id if available; otherwise fallback to group.id.
              const groupIdentifier = group._id ? String(group._id) : index.toString();
              return (
                <li key={groupIdentifier || index} className="border p-4 rounded shadow-sm">
                  <Link href={`/dashboard/group/${groupIdentifier}`}>
                    <div className="block hover:underline">
                      <h2 className="text-xl font-semibold">{group.name}</h2>
                      <p className="text-gray-700">{group.description}</p>
                      {group.members && (
                        <p className="mt-2 text-sm text-gray-500">
                          Members: {group.members.join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          )}
        </main>
  );
}