"use client";

import { deleteGroup, getGroupById, updateGroup } from "@/app/api/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/group";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function EditGroupPage() {
  const { toast } = useToast();
  const pathname = usePathname();
  const groupId = pathname.split("/")[3];
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupData = await getGroupById(groupId);
        setGroup(groupData);
        setNewName(groupData.name);
        setNewDescription(groupData.description);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching group");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleUpdateGroup = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      group_id: groupId,
      new_name: newName,
      new_description: newDescription,
    };
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      await updateGroup(payload);
      setUpdateSuccess("Group updated successfully!");
      setGroup((prev) =>
        prev ? { ...prev, name: newName, description: newDescription } : prev,
      );
    } catch (error: any) {
      setUpdateError(error.message || "Error updating group");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) {
      alert("Group id is missing");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group?",
    );
    if (!confirmDelete) return;
    try {
      await deleteGroup(groupId);
      toast({
        title: "Group Deleted",
        description: "The group was successfully deleted.",
        variant: "default",
      });
      window.location.href = "/dashboard/group";
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting Group",
        description: error.message || "Failed to delete group",
      });
    }
  };

  if (loading) return <Spinner />;
  if (error || !group)
    return <p className="text-red-500">{error || "Group not found"}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => (window.location.href = `/dashboard/group/${groupId}`)}
        >
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Group</h1>
        <div className="flex gap-1">
          <Button variant="destructive" onClick={handleDeleteGroup}>
            Delete Group
          </Button>
        </div>
      </div>
      <form
        onSubmit={handleUpdateGroup}
        className="space-y-4 bg-white p-6 border rounded-lg shadow-sm"
      >
        <div>
          <Label htmlFor="groupName" className="block font-medium mb-1">
            Group Name
          </Label>
          <Input
            id="groupName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="groupDescription" className="block font-medium mb-1">
            Description
          </Label>
          <Textarea
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
        {updateSuccess && (
          <p className="mt-2 text-green-500">{updateSuccess}</p>
        )}
      </form>
    </div>
  );
}
