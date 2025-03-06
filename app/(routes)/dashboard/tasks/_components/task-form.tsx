"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task, TaskStatus } from "@/types/task"; 
import { createTask, updateTask } from "@/app/api/task"; // Import API function
import { DateTimePickerForm } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const taskSchema = z
  .object({
    task_title: z.string().nonempty("Task title is required"),
    task_details: z.string().optional(),
    media: z.array(z.string()).optional(),
    notes: z.string().optional(),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.ASSIGNED),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    category: z.enum(["Meals", "Medication", "Therapy", "Outing"]).optional(),
    residents: z.array(z.string()).min(1, "At least one resident is required"),
    start_date: z.date({
      required_error: "Start date is required",
      invalid_type_error: "Invalid date",
    }),
    due_date: z.date({
      required_error: "Due date is required",
      invalid_type_error: "Invalid date",
    }),
    recurring: z.enum(["Daily", "Weekly", "Monthly", "Annually"]).optional(),
    end_recurring_date: z.date().optional(),
    remind_prior: z.number().optional(),
    is_ai_generated: z.boolean().default(false),
    assigned_to: z.string().nonempty("Assignee is required"),
  })
  .refine((data) => data.start_date < data.due_date, {
    message: "Start date must be before due date",
    path: ["due_date"],
  })
  .refine(
    (data) => {
      if (data.recurring && data.end_recurring_date) {
        return data.due_date < data.end_recurring_date;
      }
      return true;
    },
    {
      message: "Due date must be before end recurring date",
      path: ["end_recurring_date"],
    }
  );

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskForm({ task, onClose }: { task?: Task; onClose?: () => void }) {
  const [open, setOpen] = useState(!!task);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_title: "",
      task_details: "",
      media: [],
      notes: "",
      status: "Assigned",
      priority: undefined,
      category: undefined,
      residents: [],
      start_date: new Date(),
      due_date: new Date(),
      recurring: undefined,
      end_recurring_date: undefined,
      remind_prior: undefined,
      is_ai_generated: false,
      assigned_to: "",
    },
  });
  
  // Reset form values when editing an existing task
  useEffect(() => {
    if (task) {
      form.reset({
        task_title: task.task_title,
        task_details: task.task_details,
        media: task.media || [],
        notes: task.notes || "",
        status: task.status,
        priority: task.priority,
        category: task.category,
        resident: task.resident,
        start_date: new Date(task.start_date),
        due_date: new Date(task.due_date),
        recurring: task.recurring,
        end_recurring_date: task.end_recurring_date ? new Date(task.end_recurring_date) : undefined,
        remind_prior: task.remind_prior,
        is_ai_generated: task.is_ai_generated,
        assigned_to: task.assigned_to,
      });
      setOpen(true); // Open modal when editing a task
    }
  }, [task]);
  

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        const updatedTask = await updateTask(task.id, data); // Update the task
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) // Update UI
        );
      }
  
      setOpen(false);
      if (onClose) onClose(); // Close the modal without reloading
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };
   
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!task && (
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Task Title */}
            <FormField
              control={form.control}
              name="task_title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label htmlFor="task_title" className="label">
                    Task Title
                  </label>
                  <FormControl>
                    <Input
                      id="task_title"
                      placeholder="Task Title"
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Task Details */}
            <FormField
              control={form.control}
              name="task_details"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label htmlFor="task_details" className="label">
                    Task Details
                  </label>
                  <FormControl>
                    <Textarea
                      id="task_details"
                      placeholder="Task Details"
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Priority (Select) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <label className="label">Priority</label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Category (Select) */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <label className="label">Category</label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Therapy">Therapy</SelectItem>
                        <SelectItem value="Outing">Outing</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Residents (Comma separated input) */}
            {/* <FormField
              control={form.control}
              name="residents"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label className="label">Residents</label>
                  <FormControl>
                    <Input
                      placeholder="Enter resident IDs, comma separated"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(",").map((str) => str.trim())
                        )
                      }
                      value={field.value.join(", ")}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            /> */}

            {/* Start Date and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <label className="label">Start Date</label>
                    <FormControl>
                      <Input
                        type="date"
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <label className="label">Due Date</label>
                    <FormControl>
                      <Input
                        type="date"
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Recurring (Select) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem>
                    <label className="label">Recurring</label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* End Recurring Date */}
              <FormField
                control={form.control}
                name="end_recurring_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <label className="label">End Recurring Date</label>
                    <FormControl>
                      <Input
                        type="date"
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Remind Prior */}
            <FormField
              control={form.control}
              name="remind_prior"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label className="label">Remind Prior (minutes)</label>
                  <FormControl>
                    <Input
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ""}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Assigned To */}
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label htmlFor="assigned_to" className="label">
                    Assigned To
                  </label>
                  <FormControl>
                    <Input id="assigned_to" placeholder="Assignee" {...field} />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button type="submit">{task ? "Update Task" : "Create Task"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
