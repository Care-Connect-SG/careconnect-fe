// app/dashboard/group/[groupId]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  // Form state for adding a user
  // const [newUserEmail, setNewUserEmail] = useState("");
  // const [addingUser, setAddingUser] = useState(false);
  // const [addUserError, setAddUserError] = useState<string | null>(null);
  // const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);


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

  // const handleAddUser = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!newUserEmail) return;
  //   setAddingUser(true);
  //   setAddUserError(null);
  //   setAddUserSuccess(null);
  //   try {
  //     const res = await fetch("/api/groups/add-user", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         group_id: groupId, // using the stable identifier
  //         user_email: newUserEmail,
  //       }),
  //     });
  //     if (!res.ok) {
  //       const errData = await res.json();
  //       throw new Error(errData.error?.detail || "Failed to add user to group");
  //     }
  //     await res.json();
  //     setAddUserSuccess(`User ${newUserEmail} added successfully!`);
  //     // Update local group state (append newUserEmail to members array)
  //     setGroup((prev) =>
  //       prev ? { ...prev, members: [...(prev.members || []), newUserEmail] } : prev
  //     );
  //     setNewUserEmail("");
  //   } catch (error: any) {
  //     setAddUserError(error.message || "Error adding user");
  //   } finally {
  //     setAddingUser(false);
  //   }
  // };


  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!group) return <p>Group not found</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Edit Group</h1>
      
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
        <Button type="submit" disabled={updating}>
          {updating ? "Updating..." : "Update Group"}
        </Button>
        {updateError && <p className="mt-2 text-red-500">{updateError}</p>}
        {updateSuccess && <p className="mt-2 text-green-500">{updateSuccess}</p>}
      </form>

      {/* Add Users Button */}
      <div>
        <Link
          href={`/dashboard/group/${groupId}/add-users`}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
        >
          Add Users
        </Link>
      </div>

      {/* Display Group Details */}
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Group Details</h2>
        <p className="text-xl font-semibold">{group.name}</p>
        <p className="text-gray-700">{group.description}</p>
        {group.members && group.members.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Members:</h3>
            <ul className="list-disc ml-6">
              {group.members.map((member, i) => (
                <li key={i} className="text-gray-600">
                  {member}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}