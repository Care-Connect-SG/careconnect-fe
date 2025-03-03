"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Group {
  _id: string;
  name: string;
  description: string;
  members?: string[];
}

export default function EditGroupPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing group details
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Fetch the group details using the groupId.
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch groups");
        return res.json();
      })
      .then((data) => {
        const found = data.find((g: any) => g._id === groupId || g.id === groupId);
        if (!found) {
          setError("Group not found");
        } else {
          setGroup(found);
          setNewName(found.name);
          setNewDescription(found.description);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "An error occurred while fetching groups");
        setLoading(false);
      });
  }, [groupId]);

  // Handle form submission to update group details.
  const handleUpdateGroup = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      group_id: String(groupId),
      new_name: newName,
      new_description: newDescription,
    };
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const res = await fetch("/api/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.detail || "Failed to update group");
      }
      await res.json();
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

  // Handle group deletion with toast notifications.
  const handleDeleteGroup = async () => {
    // Ensure groupId is a single string.
    if (!groupId) {
      alert("Group id is missing");
      return;
    }
    const id = Array.isArray(groupId) ? groupId[0] : groupId;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/groups?group_id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.detail || "Failed to delete group");
      }
      toast({
        title: "Group Deleted",
        description: "The group was successfully deleted.",
        variant: "default",
      });
      router.push("/dashboard/group");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting Group",
        description: error.message || "Failed to delete group",
      });
    }
  };

  if (loading) return <Spinner />;
  if (error || !group) return <p className="text-red-500">{error || "Group not found"}</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8 relative">
      {/* Header with Edit title and action buttons */}
      <div className="flex items-center justify-between">
      <Button variant="secondary" onClick={() => router.push(`/dashboard/group/${groupId}`)}>
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Group</h1>
        <div className="flex gap-1">
          
          <Button variant="destructive" onClick={handleDeleteGroup}>
            Delete Group
          </Button>
        </div>
      </div>

      {/* Edit Group Form */}
      <form onSubmit={handleUpdateGroup} className="space-y-4 bg-white p-6 border rounded-lg shadow-sm">
        <div>
          <label htmlFor="groupName" className="block font-medium mb-1">
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
          <label htmlFor="groupDescription" className="block font-medium mb-1">
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
        <Button type="submit" disabled={updating} className="w-full">
          {updating ? "Updating..." : "Update Group"}
        </Button>
        {updateError && <p className="mt-2 text-red-500">{updateError}</p>}
        {updateSuccess && <p className="mt-2 text-green-500">{updateSuccess}</p>}
      </form>
    </main>
  );
}
