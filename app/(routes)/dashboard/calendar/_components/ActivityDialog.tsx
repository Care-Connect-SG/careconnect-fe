"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Activity, ActivityCreate } from "@/types/activity";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.date(),
  end_time: z.date(),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  selectedDate: Date;
  selectedEndDate: Date | null;
  onSave: (activity: Partial<ActivityCreate>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (activity: Activity) => void;
}

export default function ActivityDialog({
  isOpen,
  onClose,
  activity,
  selectedDate,
  selectedEndDate,
  onSave,
  onDelete,
  onDuplicate,
}: ActivityDialogProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  console.log("Session data:", {
    userId,
    userRole,
    activityCreatedBy: activity?.created_by,
    sessionUser: session?.user,
  });

  const canEdit =
    !activity ||
    (activity && (activity.created_by === userId || userRole === "Admin"));

  console.log("Can edit:", canEdit, {
    condition1: !activity,
    condition2: activity?.created_by === userId,
    condition3: userRole === "Admin",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: selectedDate,
      end_time:
        selectedEndDate || new Date(selectedDate.getTime() + 30 * 60000),
      location: "",
      category: "",
    },
  });

  useEffect(() => {
    if (activity) {
      form.reset({
        title: activity.title,
        description: activity.description || "",
        start_time: new Date(activity.start_time),
        end_time: new Date(activity.end_time),
        location: activity.location || "",
        category: activity.category || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        start_time: selectedDate,
        end_time:
          selectedEndDate || new Date(selectedDate.getTime() + 30 * 60000),
        location: "",
        category: "",
      });
    }
  }, [activity, selectedDate, selectedEndDate, form]);

  const onSubmit = (data: FormValues) => {
    try {
      if (data.end_time <= data.start_time) {
        toast({
          variant: "destructive",
          title: "Invalid Time",
          description: "End time must be after start time",
        });
        return;
      }

      const activityData: Partial<ActivityCreate> = {
        title: data.title,
        description: data.description,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        location: data.location,
        category: data.category,
      };

      onSave(activityData);
    } catch (error) {
      console.error("Failed to save activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save activity",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {activity
              ? canEdit
                ? "Edit Activity"
                : "View Activity"
              : "Create Activity"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Activity title"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Activity description"
                      className="resize-none"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter location"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              {activity && canEdit && (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => activity._id && onDelete(activity._id)}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onDuplicate(activity)}
                  >
                    Duplicate
                  </Button>
                </>
              )}
              {canEdit && (
                <Button type="submit">{activity ? "Update" : "Create"}</Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
