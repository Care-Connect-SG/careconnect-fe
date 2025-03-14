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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TaskStatus } from "@/types/task";
import { Textarea } from "@/components/ui/textarea";

interface TaskReassignmentActionsProps {
  taskId: string;
  taskTitle: string;
  currentNurseId: string;
  currentNurseName: string;
  requestingNurseName: string;
  status: TaskStatus;
}

export function TaskReassignmentActions({
  taskId,
  taskTitle,
  currentNurseId,
  currentNurseName,
  requestingNurseName,
  status,
}: TaskReassignmentActionsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for accepting reassignment
  const acceptReassignment = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/accept-reassignment`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Reassignment Accepted",
        description: "You have accepted the task reassignment.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept task reassignment.",
      });
    },
  });

  // Mutation for rejecting reassignment
  const rejectReassignment = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_API_URL}/tasks/${taskId}/reject-reassignment`,
        {
          rejection_reason: rejectionReason,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Reassignment Rejected",
        description: "You have rejected the task reassignment.",
      });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject task reassignment.",
      });
    },
  });

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for rejecting the reassignment.",
      });
      return;
    }
    rejectReassignment.mutate();
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="success"
        onClick={() => acceptReassignment.mutate()}
        disabled={acceptReassignment.isPending}
      >
        {acceptReassignment.isPending ? "Accepting..." : "Accept"}
      </Button>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Reject</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Task Reassignment</DialogTitle>
            <DialogDescription>
              {requestingNurseName} has requested to reassign the task "{taskTitle}" to you.
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason:</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter your reason for rejecting the reassignment..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectReassignment.isPending || !rejectionReason.trim()}
            >
              {rejectReassignment.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 