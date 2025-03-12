"use client";

import { getResidents } from "@/app/api/resident";
import { createTask, updateTask } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Task, TaskStatus } from "@/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    recurring: z
      .enum(["Daily", "Weekly", "Monthly", "Annually"])
      .nullable()
      .optional(),
    end_recurring_date: z.date().nullable().optional(),
    remind_prior: z.number().nullable().optional(),
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
    },
  );

export type TaskForm = z.infer<typeof taskSchema>;

export default function TaskForm({
  task,
  onClose,
  setTasks,
  defaultResident,
  open,
}: {
  task?: Task;
  onClose?: () => void;
  setTasks?: (updater: Task | ((prevTasks: Task[]) => Task[])) => void;
  defaultResident?: string;
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(!!task || !!open);
  const { toast } = useToast();
  const [nurses, setNurses] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_title: "",
      task_details: "",
      media: [],
      notes: "",
      status: TaskStatus.ASSIGNED,
      priority: undefined,
      category: undefined,
      residents: defaultResident ? [defaultResident] : [],
      start_date: new Date(),
      due_date: new Date(),
      recurring: undefined,
      end_recurring_date: undefined,
      remind_prior: undefined,
      is_ai_generated: false,
      assigned_to: "",
    },
  });

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
        residents: task.resident ? [task.resident] : [],
        start_date: new Date(task.start_date),
        due_date: new Date(task.due_date),
        recurring: task.recurring,
        end_recurring_date: task.end_recurring_date
          ? new Date(task.end_recurring_date)
          : undefined,
        remind_prior: task.remind_prior,
        is_ai_generated: task.is_ai_generated,
        assigned_to: task.assigned_to,
      });
      setIsOpen(true);
    } else if (defaultResident) {
      form.setValue("residents", [defaultResident]);
    }
  }, [task, form, defaultResident]);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nursesData, residentsData] = await Promise.all([
          getAllNurses(),
          getResidents(),
        ]);
        setNurses(nursesData);
        setResidents(residentsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load nurses and residents data",
        });
      }
    };
    fetchData();
  }, [toast]);

  const onSubmit = async (data: TaskForm) => {
    try {
      if (task) {
        const updatedTask = await updateTask(task.id, data);
        if (setTasks) {
          setTasks(updatedTask);
        }
        toast({
          variant: "default",
          title: "Task Updated",
          description: "Task has been updated successfully",
        });
      } else {
        const newTasks = await createTask(data);
        if (setTasks) {
          setTasks((prevTasks) => [...newTasks, ...prevTasks]);
        } else {
          toast({
            variant: "default",
            title: "Tasks Created",
            description: `${newTasks.length} task(s) created successfully`,
          });
        }
      }
      setIsOpen(false);
      if (onClose) onClose();
    } catch (error) {
      let errorMessage = task
        ? "Failed to update task. Please try again."
        : "Failed to create task. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {},
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {!task && !open && (
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Edit the details of your task below."
              : "Fill in the details below to create a new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="task_title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label>Task Title</Label>
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
            <FormField
              control={form.control}
              name="task_details"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label>Task Details</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <Label>Priority</Label>
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
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Label>Category</Label>
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
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label>Assigned To</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a nurse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nurses.map((nurse) => (
                        <SelectItem key={nurse.id} value={nurse.id}>
                          {nurse.name} ({nurse.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              name="residents"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label>Residents</Label>
                  <Select
                    onValueChange={(value) => field.onChange([value])}
                    defaultValue={field.value?.[0]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label>Start Date</Label>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date);
                        }}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
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
                    <Label>Due Date</Label>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date);
                        }}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem>
                    <Label>Recurring</Label>
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
              <FormField
                control={form.control}
                name="end_recurring_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label>End Recurring Date</Label>
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
            <FormField
              control={form.control}
              name="remind_prior"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label>Remind Prior (minutes)</Label>
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
            <Button type="submit">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
