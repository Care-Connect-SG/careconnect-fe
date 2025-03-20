import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Group } from "@/types/group";

export const getGroups = async (): Promise<Group[]> => {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/groups/`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errData = await res.json();
      throw Error(errData.detail || "Error fetching groups");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getGroupById = async (groupId: string): Promise<Group> => {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/groups/${encodeURIComponent(
        groupId,
      )}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errData = await res.json();
      throw Error(errData.detail || "Error fetching group");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const createGroup = async (group: {
  name: string;
  description: string;
  members: string[];
}): Promise<Group> => {
  const payload = {
    group_id: "",
    name: group.name,
    description: group.description,
    members: group.members,
  };
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/groups/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const errData = await res.json();
      throw Error(errData.detail || "Error creating group");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updateGroup = async (params: {
  group_id: string;
  new_name: string;
  new_description: string;
}): Promise<Group> => {
  const { group_id, new_name, new_description } = params;
  try {
    const res = await fetchWithAuth(
      `${
        process.env.NEXT_PUBLIC_BE_API_URL
      }/groups/edit?group_id=${encodeURIComponent(
        group_id,
      )}&new_name=${encodeURIComponent(
        new_name,
      )}&new_description=${encodeURIComponent(new_description)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errData = await res.json();
      throw Error(errData.detail || "Error updating group");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export async function deleteGroup(groupId: string) {
  if (!groupId) throw Error("Group id is required");
  try {
    const res = await fetchWithAuth(
      `${
        process.env.NEXT_PUBLIC_BE_API_URL
      }/groups/delete?group_id=${encodeURIComponent(groupId)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errData = await res.json();
      throw Error(errData.detail || "Error deleting group");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function addUserToGroup(payload: {
  group_id: string;
  user_id: string;
}) {
  const res = await fetchWithAuth(
    `${
      process.env.NEXT_PUBLIC_BE_API_URL
    }/groups/add-user?group_id=${encodeURIComponent(
      payload.group_id,
    )}&user_id=${encodeURIComponent(payload.user_id)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    const errData = await res.json();
    throw Error(errData.detail || "Failed to add user to group");
  }
  return await res.json();
}

export async function removeUserFromGroup(groupId: string, userId: string) {
  try {
    const res = await fetchWithAuth(
      `${
        process.env.NEXT_PUBLIC_BE_API_URL
      }/groups/remove-user?group_id=${encodeURIComponent(
        groupId,
      )}&user_id=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errData = await res.json();
      throw Error(errData.detail || "Failed to remove user from group");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}
