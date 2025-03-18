"use client";

import { createGroup } from "@/app/api/group";
import { getUsers } from "@/app/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const createGroupSchema = z.object({
  groupName: z
    .string()
    .min(6, { message: "Group name must be at least 6 characters long" }),
  groupDescription: z.string().min(12, {
    message: "Group description must be at least 12 characters long",
  }),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export default function CreateGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setPageName } = useBreadcrumb();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectValue, setSelectValue] = useState<string>(""); // controlled select value
  const [creating, setCreating] = useState(false);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      groupDescription: "",
    },
  });

  useEffect(() => {
    setPageName("Create Group");
  }, [setPageName]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectChange = (value: string) => {
    if (!selectedMembers.includes(value)) {
      setSelectedMembers((prev) => [...prev, value]);
    }
    setSelectValue("");
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.filter((memberId) => memberId !== userId),
    );
  };

  const handleCreateGroup = async (values: CreateGroupFormValues) => {
    setCreating(true);
    try {
      await createGroup({
        name: values.groupName,
        description: values.groupDescription,
        members: selectedMembers,
      });

      toast({
        title: "Group Created",
        description: "Group created successfully!",
        variant: "default",
      });

      router.push("/dashboard/group");
    } catch (err: any) {
      console.error("Error creating group:", err);
      toast({
        title: "Failed to create group",
        description:
          err.message || "An error occurred while creating the group.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const availableUsers = users.filter(
    (user) =>
      (user.role === "Admin" || user.role === "Nurse") &&
      !selectedMembers.includes(user.id),
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreateGroup)}
          className="space-y-6 bg-white p-6 border rounded-lg shadow-sm"
        >
          <FormField
            control={form.control}
            name="groupName"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Group Name"
                    {...field}
                    className="mt-1 block w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupDescription"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Group Description"
                    {...field}
                    className="mt-1 block w-full"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <Label className="block font-medium mb-1">Members</Label>
            {loadingUsers ? (
              <div className="py-2">
                <Spinner />
              </div>
            ) : (
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  setSelectValue(value);
                  handleSelectChange(value);
                }}
              >
                <SelectTrigger className="w-full">
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
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap !mt-2 gap-2">
                {selectedMembers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <Badge
                      key={userId}
                      className="bg-blue-100 text-blue-800 flex items-center gap-1 hover:bg-blue-100 rounded-xl py-2"
                    >
                      {user ? user.name : userId}
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveMember(userId)}
                        className="p-0 hover:bg-transparent h-fit"
                      >
                        <X className="ml-1 w-4 h-4" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <Button type="submit" disabled={creating} className="w-full">
            {creating ? <Spinner /> : "Create Group"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
