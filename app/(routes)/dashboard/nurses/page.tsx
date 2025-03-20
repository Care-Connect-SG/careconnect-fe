"use client";

import CreateUserDialog from "@/app/(routes)/dashboard/nurses/_components/create-user-dialog";
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
import { Input } from "@/components/ui/input";
import RoleChip from "@/components/ui/roleChip";
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
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { PlusIcon, TrashIcon } from "lucide-react";
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

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
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

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        fetchUsers();
        setIsConfirmationModalOpen(false);
        setUserToDelete(null);
        toast({
          title: "User deleted successfully",
          description: `${userToDelete.name} has been deleted`,
        });
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error deleting user, please try again",
          description: error.message,
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

    setFilteredUsers(filtered);
  }, [searchQuery, filter, users]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Management</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-60 p-3 border rounded-lg shadow-sm bg-white text-gray-700">
            <SelectValue placeholder="Filter Users" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg rounded-lg">
            <SelectItem value="All Users">All Users</SelectItem>
            <SelectItem value="Admin">Admins</SelectItem>
            <SelectItem value="Nurse">Nurses</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md p-3 border rounded-lg shadow-sm bg-white text-gray-700"
        />
      </div>

      <div className="flex mx-auto">
        <Table className="w-full max-w-5xl shadow-lg rounded-lg overflow-hidden">
          <TableHeader>
            <TableRow className="bg-gray-900 text-white">
              <TableHead className="p-4 text-left">Email</TableHead>
              <TableHead className="p-4 text-left">Name</TableHead>
              <TableHead className="p-4 text-left">Contact Number</TableHead>
              <TableHead className="p-4 text-left">Role</TableHead>
              <TableHead className="p-4 text-left">Organisation Rank</TableHead>
              <TableHead className="p-4 text-left">Gender</TableHead>
              <TableHead className="p-4 text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow
                key={user.id}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition cursor-pointer`}
                onClick={() =>
                  router.push(
                    session?.user.id === user.id
                      ? "/dashboard/profile"
                      : `/dashboard/nurses/${user.id}`,
                  )
                }
              >
                <TableCell className="p-4">{user.email}</TableCell>
                <TableCell className="p-4">{user.name}</TableCell>
                <TableCell className="p-4">
                  {user.contact_number || "N/A"}
                </TableCell>
                <TableCell className="p-4">
                  <RoleChip role={user.role} />
                </TableCell>
                <TableCell className="p-4">
                  {user.organisation_rank || "N/A"}
                </TableCell>
                <TableCell className="p-4">{user.gender}</TableCell>
                <TableCell className="p-4 flex gap-3">
                  <TrashIcon
                    className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserToDelete(user);
                      setIsConfirmationModalOpen(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        className="fixed bottom-8 right-8 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
        onClick={() => setIsModalOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

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
        <AlertDialogTrigger asChild></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Nurses;
