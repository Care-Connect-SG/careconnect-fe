"use client";

import { addUserToGroup } from "@/app/api/group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { useState } from "react";

interface SelectAddUserProps {
  groupId: string;
  availableUsers: User[];
  onUserAdded: (user: User) => void;
}

export function SelectAddUser({
  groupId,
  availableUsers,
  onUserAdded,
}: SelectAddUserProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const handleValueChange = async (value: string) => {
    const user = availableUsers.find((u) => u.id === value) || null;
    if (!user) return;
    setSelectedUser(user);
    setAdding(true);
    try {
      await addUserToGroup({ group_id: groupId, user_id: user.id });
      toast({
        title: `Successfully added ${user.name}`,
        description: "User has been added to the group",
      });
      onUserAdded(user);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add user",
        description: error.message || "Please try again",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      {adding ? (
        <div className="py-2">
          <Spinner />
        </div>
      ) : (
        <Select
          value={selectedUser?.id || ""}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select a user to add" />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
