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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  reminder_minutes: z.string().optional(),
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
  canUserEditActivity?: (activity: Activity) => boolean;
  isAdmin: boolean;
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
  canUserEditActivity,
  isAdmin,
}: ActivityDialogProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const canEdit =
    !activity ||
    (activity &&
      (isAdmin ||
        (canUserEditActivity
          ? canUserEditActivity(activity)
          : activity.created_by === userId)));

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
      reminder_minutes: "5",
    },
  });

  useEffect(() => {
    if (activity) {
      const startDate = new Date(
        activity.start_time + (activity.start_time.endsWith("Z") ? "" : "Z"),
      );
      const endDate = new Date(
        activity.end_time + (activity.end_time.endsWith("Z") ? "" : "Z"),
      );

      form.reset({
        title: activity.title,
        description: activity.description || "",
        start_time: startDate,
        end_time: endDate,
        location: activity.location || "",
        category: activity.category || "",
        reminder_minutes: activity.reminder_minutes?.toString() || "5",
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
        reminder_minutes: "5",
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
        reminder_minutes: parseInt(data.reminder_minutes || "5"),
      };

      onSave(activityData);
    } catch (error) {
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
              name="reminder_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder</FormLabel>
                  <Select
                    disabled={!canEdit}
                    onValueChange={field.onChange}
                    value={field.value?.toString() || "5"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reminder time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                      <SelectItem value="2880">2 days before</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-between mt-6">
              <div>
                {activity && canEdit && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async () => {
                      if (!activity.id) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Activity ID is missing",
                        });
                        return;
                      }

                      try {
                        onDelete(activity.id);
                        toast({
                          title: "Success",
                          description: "Activity deleted successfully",
                        });
                        onClose();
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description:
                            error instanceof Error
                              ? error.message
                              : "Failed to delete activity. Please try again.",
                        });
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {activity && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onDuplicate(activity);
                      onClose();
                    }}
                  >
                    Duplicate
                  </Button>
                )}
                {canEdit && (
                  <Button type="submit" variant="default">
                    {activity ? "Update" : "Create"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
