import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TaskStatus } from "@/types/task";

interface TaskReassignmentFormProps {
  taskId: string;
  currentNurseId: string;
  currentNurseName: string;
}

interface Nurse {
  id: string;
  full_name: string;
}

export function TaskReassignmentForm({
  taskId,
  currentNurseId,
  currentNurseName,
}: TaskReassignmentFormProps) {
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available nurses
  const { data: nurses = [], isLoading } = useQuery<Nurse[]>({
    queryKey: ["nurses"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_API_URL}/users/nurses`);
      return response.data;
    },
  });

  // Mutation for requesting reassignment
  const requestReassignment = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/request-reassignment`,
        {
          requested_to: selectedNurseId,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Reassignment Requested",
        description: "The task reassignment request has been sent.",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to request task reassignment.",
      });
    },
  });

  const handleReassignmentRequest = () => {
    if (!selectedNurseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a nurse to reassign the task to.",
      });
      return;
    }
    requestReassignment.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Request Reassignment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Task Reassignment</DialogTitle>
          <DialogDescription>
            Select a nurse to reassign this task to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Currently assigned to:</p>
            <p className="text-sm text-gray-500">{currentNurseName}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reassign to:</label>
            <Select
              value={selectedNurseId}
              onValueChange={setSelectedNurseId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a nurse" />
              </SelectTrigger>
              <SelectContent>
                {nurses
                  .filter((nurse) => nurse.id !== currentNurseId)
                  .map((nurse) => (
                    <SelectItem key={nurse.id} value={nurse.id}>
                      {nurse.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReassignmentRequest}
            disabled={!selectedNurseId || requestReassignment.isPending}
          >
            {requestReassignment.isPending ? "Requesting..." : "Request Reassignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 