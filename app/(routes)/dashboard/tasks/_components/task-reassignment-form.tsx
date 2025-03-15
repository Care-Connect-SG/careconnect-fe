"use client";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

interface TaskReassignmentFormProps {
  taskId: string;
  currentNurseId: string;
  currentNurseName: string;
}

interface Nurse {
  id: string;
  name: string;
}

export function TaskReassignmentForm({
  taskId,
  currentNurseId,
  currentNurseName,
}: TaskReassignmentFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available nurses
  const { data: nurses, isLoading } = useQuery({
    queryKey: ["nurses"],
    queryFn: async () => {
      const response = await axios.get("/api/tags/caregivers");
      return response.data.filter(
        (nurse: Nurse) => nurse.id !== currentNurseId,
      );
    },
  });

  // Request reassignment mutation
  const requestReassignmentMutation = useMutation({
    mutationFn: async (targetNurseId: string) => {
      const response = await axios.post(
        `/api/tasks/${taskId}/request-reassignment`,
        {
          target_nurse_id: targetNurseId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Reassignment Requested",
        description:
          "The task reassignment request has been sent successfully.",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to request reassignment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNurseId) {
      toast({
        title: "Error",
        description: "Please select a nurse to reassign the task to",
        variant: "destructive",
      });
      return;
    }
    requestReassignmentMutation.mutate(selectedNurseId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Request Reassignment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Task Reassignment</DialogTitle>
          <DialogDescription>
            Select a nurse to reassign this task to. The selected nurse will be
            notified and can accept or reject the request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Current Nurse</Label>
              <div className="text-sm text-muted-foreground">
                {currentNurseName}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Select New Nurse</Label>
              <Select
                value={selectedNurseId}
                onValueChange={setSelectedNurseId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a nurse" />
                </SelectTrigger>
                <SelectContent>
                  {nurses?.map((nurse: Nurse) => (
                    <SelectItem key={nurse.id} value={nurse.id}>
                      {nurse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              type="submit"
              disabled={
                !selectedNurseId || requestReassignmentMutation.isPending
              }
            >
              {requestReassignmentMutation.isPending
                ? "Requesting..."
                : "Request Reassignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
