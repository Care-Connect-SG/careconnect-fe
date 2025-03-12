export const getGroups = async (): Promise<any> => {
  const endpoint = `${process.env.NEXT_PUBLIC_BE_API_URL}/groups`;
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Error fetching groups: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};
export const getGroupById = async (groupId: string): Promise<any> => {
  const endpoint = `${
    process.env.NEXT_PUBLIC_BE_API_URL
  }/groups/${encodeURIComponent(groupId)}`;
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Error fetching group: ${res.statusText}`);
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
}): Promise<any> => {
  const payload = {
    group_id: "",
    name: group.name,
    description: group.description,
    members: group.members,
  };
  const endpoint = `${process.env.NEXT_PUBLIC_BE_API_URL}/groups/create`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Error creating group: ${await res.text()}`);
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
}): Promise<any> => {
  const { group_id, new_name, new_description } = params;
  const endpoint = `${
    process.env.NEXT_PUBLIC_BE_API_URL
  }/groups/edit?group_id=${encodeURIComponent(
    group_id,
  )}&new_name=${encodeURIComponent(
    new_name,
  )}&new_description=${encodeURIComponent(new_description)}`;
  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Error updating group: ${await res.text()}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deleteGroup = async (groupId: string): Promise<any> => {
  if (!groupId) throw new Error("Group id is required");
  const endpoint = `${
    process.env.NEXT_PUBLIC_BE_API_URL
  }/groups/delete?group_id=${encodeURIComponent(groupId)}`;
  try {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Error deleting group: ${await res.text()}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export async function addUserToGroup(payload: {
  group_id: string;
  user_id: string;
}) {
  const res = await fetch("/api/groups/add-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.detail || "Failed to add user to group");
  }
  return await res.json();
}

export const removeUserFromGroup = async (
  groupId: string,
  userId: string,
): Promise<any> => {
  const endpoint = `${
    process.env.NEXT_PUBLIC_BE_API_URL
  }/groups/remove-user?group_id=${encodeURIComponent(
    groupId,
  )}&user_id=${encodeURIComponent(userId)}`;
  try {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to remove user: ${await res.text()}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};
