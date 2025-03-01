// app/dashboard/group/[groupId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface Group {
  _id: string; // Using _id now since the backend returns _id
  name: string;
  description: string;
  members?: string[];
}

export default function EditGroupPage() {
  // Retrieve groupId from the dynamic route
  const { groupId } = useParams();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Fetch all groups then find the group with the matching group_id.
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch groups");
        }
        return res.json();
      })
      .then((data) => {
        // Filter group using group_id (or fallback to id)
        const found = data.find((g: any) => g._id === groupId || g.id === groupId);
        if (!found) {
          setError("Group not found");
        } else {
          setGroup(found);
          // Populate form fields with current values.
          setNewName(found.name);
          setNewDescription(found.description);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [groupId]);

  // Handle form submission to update group details.
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating group with id:", groupId);
    const payload = {
      group_id: String(groupId),
      new_name: newName,
      new_description: newDescription,
    };
    console.log("Payload for update:", payload);
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const res = await fetch("/api/groups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.detail || "Failed to update group");
      }
      const data = await res.json();
      setUpdateSuccess("Group updated successfully!");
      setGroup((prev) =>
        prev ? { ...prev, name: newName, description: newDescription } : prev
      );
    } catch (error: any) {
      setUpdateError(error.message || "Error updating group");
    } finally {
      setUpdating(false);
    }
  };


  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!group) return <p>Group not found</p>;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Edit Group</h1>
      <form onSubmit={handleUpdateGroup} className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block font-medium">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="groupDescription" className="block font-medium">
            Description
          </label>
          <textarea
            id="groupDescription"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          disabled={updating}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {updating ? "Updating..." : "Update Group"}
        </button>
      </form>
      {updateError && <p className="mt-2 text-red-500">{updateError}</p>}
      {updateSuccess && <p className="mt-2 text-green-500">{updateSuccess}</p>}
    </main>
  );
}
