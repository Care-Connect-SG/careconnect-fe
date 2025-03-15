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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

interface TaskReassignmentActionsProps {
  taskId: string;
  taskTitle: string;
  currentNurseId: string;
  currentNurseName: string;
  requestingNurseName: string;
  status: string;
}

export function TaskReassignmentActions({
  taskId,
  taskTitle,
  currentNurseId,
  currentNurseName,
  requestingNurseName,
  status,
}: TaskReassignmentActionsProps) {
  const [open, setOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Accept reassignment mutation
  const acceptReassignmentMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `/api/tasks/${taskId}/accept-reassignment`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Task Accepted",
        description: "You have accepted the task reassignment.",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to accept reassignment",
        variant: "destructive",
      });
    },
  });

  // Reject reassignment mutation
  const rejectReassignmentMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await axios.post(
        `/api/tasks/${taskId}/reject-reassignment`,
        {
          rejection_reason: reason,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Task Rejected",
        description: "You have rejected the task reassignment.",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to reject reassignment",
        variant: "destructive",
      });
    },
  });

  // Handle task self mutation
  const handleTaskSelfMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/tasks/${taskId}/handle-self`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Task Updated",
        description: "You will now handle this task yourself.",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejecting the task",
        variant: "destructive",
      });
      return;
    }
    rejectReassignmentMutation.mutate(rejectionReason);
  };

  if (status === "Reassignment Requested") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Respond to Reassignment Request
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Reassignment Request</DialogTitle>
            <DialogDescription>
              {requestingNurseName} has requested to reassign the task "
              {taskTitle}" to you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Current Nurse</label>
              <div className="text-sm text-muted-foreground">
                {currentNurseName}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Requesting Nurse</label>
              <div className="text-sm text-muted-foreground">
                {requestingNurseName}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Rejection Reason (if rejecting)
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={rejectReassignmentMutation.isPending}
            >
              {rejectReassignmentMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              type="button"
              onClick={() => acceptReassignmentMutation.mutate()}
              disabled={acceptReassignmentMutation.isPending}
            >
              {acceptReassignmentMutation.isPending ? "Accepting..." : "Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (status === "Reassignment Rejected") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Handle Task Myself
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Handle Task Yourself</DialogTitle>
            <DialogDescription>
              The task reassignment was rejected. You can now handle this task
              yourself.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Task</label>
              <div className="text-sm text-muted-foreground">{taskTitle}</div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleTaskSelfMutation.mutate()}
              disabled={handleTaskSelfMutation.isPending}
            >
              {handleTaskSelfMutation.isPending
                ? "Updating..."
                : "Handle Task Myself"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
