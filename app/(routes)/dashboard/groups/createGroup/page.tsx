"use client";

import { createGroup } from "@/app/api/group";
import { getUsers } from "@/app/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { Check, CirclePlus, UsersRound, X } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
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
  const [searchValue, setSearchValue] = useState("");

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
        setLoadingUsers(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err: any) {
        console.error("Error fetching users:", err.message);
        toast({
          title: "An error occurred while fetching users",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateGroup = async (values: CreateGroupFormValues) => {
    try {
      await createGroup({
        name: values.groupName,
        description: values.groupDescription,
        members: selectedMembers,
      });

      toast({
        title: "Group Created Successfully",
        description: `Group ${values.groupName} has been created successfully`,
        variant: "default",
      });

      router.push("/dashboard/groups");
    } catch (err: any) {
      console.error("Error creating group:", err);
      toast({
        title: "An error occurred while creating the group, please try again",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.filter((memberId) => memberId !== userId),
    );
  };

  const availableUsers = users.filter(
    (user) =>
      (user.role === "Admin" || user.role === "Nurse") &&
      !selectedMembers.includes(user.id),
  );

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <Spinner />
      </div>
    );
  }

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
            <div className="flex items-center gap-2 mb-2">
              <UsersRound className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-medium text-gray-700">
                Group Members
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full py-1 px-2 transition-colors">
                    <CirclePlus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[280px]">
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {availableUsers
                          .filter(
                            (user) =>
                              user.name
                                .toLowerCase()
                                .includes(searchValue.toLowerCase()) ||
                              user.email
                                .toLowerCase()
                                .includes(searchValue.toLowerCase()),
                          )
                          .map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => {
                                setSelectedMembers((prev) =>
                                  prev.includes(user.id)
                                    ? prev
                                    : [...prev, user.id],
                                );
                                setSearchValue("");
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-blue-600",
                                  selectedMembers.includes(user.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {user.name} ({user.email})
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedMembers.length > 0 ? (
                selectedMembers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return user ? (
                    <Badge
                      key={userId}
                      variant="secondary"
                      className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      {user.name}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => handleRemoveMember(userId)}
                      />
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-xs text-gray-500 italic">
                  No members added
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedMembers.length}
          >
            Create Group
          </Button>
        </form>
      </Form>
    </div>
  );
}
