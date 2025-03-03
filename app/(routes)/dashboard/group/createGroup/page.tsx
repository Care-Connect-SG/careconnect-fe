"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export default function CreateGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BE_API_SECRET}`,
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      });
      if (!res.ok) {
        throw new Error(`Error creating group: ${res.statusText}`);
      }
      await res.json();

      toast({
        title: "Group Created",
        description: "Group created successfully!",
        variant: "default",
      });

      // Redirect to the groups list page upon successful creation.
      router.push("/dashboard/group");
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Group</h1>
      <form onSubmit={handleCreateGroup} className="space-y-4 bg-white p-6 border rounded-lg shadow-sm">
        <div>
          <label htmlFor="groupName" className="block font-medium mb-1">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
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
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            rows={4}
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Group"}
        </Button>
      </form>
      {creating && <Spinner />}
    </main>
  );
}
