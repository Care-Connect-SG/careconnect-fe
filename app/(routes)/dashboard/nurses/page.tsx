"use client";

import CreateUserDialog from "@/app/(routes)/dashboard/nurses/_components/create-user-dialog";
import RoleChip from "@/app/(routes)/dashboard/nurses/_components/role-chip";
import { deleteUser, getUsers } from "@/app/api/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Nurses = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("All Users");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);

      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setFilteredUsers(sorted);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (
        key === "name" ||
        key === "email" ||
        key === "gender" ||
        key === "organisation_rank"
      ) {
        const aValue = a[key] || "";
        const bValue = b[key] || "";
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (key === "role") {
        const roleOrder = { Admin: 1, Nurse: 2 };
        const aRole = a.role as keyof typeof roleOrder;
        const bRole = b.role as keyof typeof roleOrder;
        return direction === "asc"
          ? roleOrder[aRole] - roleOrder[bRole]
          : roleOrder[bRole] - roleOrder[aRole];
      }

      return 0;
    });

    setFilteredUsers(sortedUsers);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        fetchUsers();
        setIsConfirmationModalOpen(false);
        setUserToDelete(null);
        toast({
          title: "Success",
          description: `${userToDelete.name} has been deleted successfully.`,
        });
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast({
          title: "An error occurred",
          description: `Failed to delete user: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (filter !== "All Users") {
      filtered = filtered.filter((user) => user.role === filter);
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (
          sortConfig.key === "name" ||
          sortConfig.key === "email" ||
          sortConfig.key === "gender" ||
          sortConfig.key === "organisation_rank"
        ) {
          const aValue = a[sortConfig.key] || "";
          const bValue = b[sortConfig.key] || "";
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (sortConfig.key === "role") {
          const roleOrder = { Admin: 1, Nurse: 2 };
          const aRole = a.role as keyof typeof roleOrder;
          const bRole = b.role as keyof typeof roleOrder;
          return sortConfig.direction === "asc"
            ? roleOrder[aRole] - roleOrder[bRole]
            : roleOrder[bRole] - roleOrder[aRole];
        }

        return 0;
      });
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filter, users, sortConfig]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          User Management
        </h1>

        <div className="flex flex-row space-x-4">
          <div className="relative w-[400px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Filter Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Users">All Users</SelectItem>
              <SelectItem value="Admin">Admins</SelectItem>
              <SelectItem value="Nurse">Nurses</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span className="font-medium">Add User</span>
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border rounded-lg bg-gray-50">
          {searchQuery || filter !== "All Users"
            ? "No users found matching your search criteria."
            : "No users found."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name{" "}
                      {sortConfig.key === "name" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email{" "}
                      {sortConfig.key === "email" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact Number
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1">
                      Role{" "}
                      {sortConfig.key === "role" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("organisation_rank")}
                  >
                    <div className="flex items-center gap-1">
                      Organisation Rank{" "}
                      {sortConfig.key === "organisation_rank" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("gender")}
                  >
                    <div className="flex items-center gap-1">
                      Gender{" "}
                      {sortConfig.key === "gender" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-blue-50 hover:duration-300 ease-in-out"
                    onClick={() =>
                      router.push(
                        session?.user.id === user.id
                          ? "/dashboard/profile"
                          : `/dashboard/nurses/${user.id}`,
                      )
                    }
                  >
                    <TableCell className="px-6 py-4 font-medium text-gray-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-900">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-900">
                      {user.contact_number || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <RoleChip role={user.role} />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-900">
                      {user.organisation_rank || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-900">
                      {user.gender || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/nurses/${user.id}`);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(user);
                              setIsConfirmationModalOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CreateUserDialog
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onUserCreated={fetchUsers}
        />
      )}

      <AlertDialog
        open={isConfirmationModalOpen}
        onOpenChange={setIsConfirmationModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Nurses;
