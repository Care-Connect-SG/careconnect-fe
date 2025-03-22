"use client";

import { requestReassignment } from "@/app/api/task";
import { getAllTagNurses } from "@/app/api/user";
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

  const { data: nurses, isLoading } = useQuery({
    queryKey: ["nurses"],
    queryFn: () => getAllTagNurses(currentNurseId),
  });

  const requestReassignmentMutation = useMutation({
    mutationFn: async (targetNurseId: string) => {
      try {
        const responseData = await requestReassignment(taskId, targetNurseId);
        return responseData;
      } catch (error: any) {
        console.error("Request failed:", {
          error,
          message: error.message,
          response: error.response,
          stack: error.stack,
        });
        throw error;
      }
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
      console.error("Mutation error:", {
        error,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
      toast({
        title: "Error",
        description: error.message || "Failed to request reassignment",
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
      <div onClick={(e) => e.stopPropagation()}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
          >
            Request Reassignment
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle>Request Task Reassignment</DialogTitle>
            <DialogDescription>
              Select a nurse to reassign this task to. The selected nurse will
              be notified and can accept or reject the request.
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
                  onValueChange={(value) => {
                    setSelectedNurseId(value);
                  }}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedNurseId || requestReassignmentMutation.isPending
                }
                onClick={(e) => e.stopPropagation()}
              >
                {requestReassignmentMutation.isPending
                  ? "Requesting..."
                  : "Request Reassignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  );
}
