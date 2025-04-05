"use client";

import { getResidents } from "@/app/api/resident";
import { createTask, getAITaskSuggestion, updateTask } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarIcon,
  ChevronsDown,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const taskSchema = z
  .object({
    task_title: z
      .string()
      .min(3, "Task title must be at least 3 characters")
      .max(255, "Task title must be less than 255 characters"),
    task_details: z.string().optional(),
    media: z.array(z.string()).optional(),
    notes: z.string().optional(),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.ASSIGNED),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    category: z
      .enum(["Meals", "Medication", "Therapy", "Outing", "Others"])
      .optional(),
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
    update_series: z.boolean().optional(),
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
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [nurses, setNurses] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [formData, setFormData] = useState<TaskForm | null>(null);
  const [prefilledFields, setPrefilledFields] = useState<
    Record<string, string>
  >({});

  const defaultFormValues = {
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
  };

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultFormValues,
  });

  const canProceed =
    !!form.watch("residents")?.[0] && !!form.watch("assigned_to");

  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultFormValues);
      setPrefilledFields({});
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (task) {
      form.reset({
        task_title: task.task_title,
        task_details: task.task_details,
        media: task.media || [],
        notes: task.notes || "",
        status: task.status,
        priority: task.priority || TaskPriority.LOW,
        category: task.category || TaskCategory.OTHERS,
        residents: task.resident ? [task.resident] : [],
        start_date: new Date(task.start_date + "Z"),
        due_date: new Date(task.due_date + "Z"),
        recurring: task.recurring,
        end_recurring_date: task.end_recurring_date
          ? new Date(task.end_recurring_date + "Z")
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nursesData, residentsData] = await Promise.all([
          getAllNurses(),
          getResidents(),
        ]);

        if (nursesData) {
          setNurses(nursesData);
        }
        if (residentsData) {
          setResidents(residentsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load nurses and residents data",
        });
      }
    };

    loadData();
  }, [toast]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      form.reset(defaultFormValues);
      setPrefilledFields({});
      if (onClose) {
        onClose();
      }
    }
  };

  const invalidateTaskQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    const currentDate = format(new Date(), "yyyy-MM-dd");
    queryClient.invalidateQueries({
      queryKey: ["tasks", "", "", "", currentDate],
    });
  };

  const onSubmit = async (data: TaskForm) => {
    try {
      setIsLoading(true);
      const formData = {
        ...data,
        start_date: new Date(data.start_date),
        due_date: new Date(data.due_date),
        end_recurring_date: data.end_recurring_date
          ? new Date(data.end_recurring_date)
          : undefined,
      };

      if (task) {
        if (task.recurring) {
          setFormData(formData);
          setShowRecurringDialog(true);
          return;
        }
        const updatedTask = await updateTask(task.id, formData);
        if (setTasks) {
          setTasks(updatedTask);
        }
        invalidateTaskQueries();
        toast({
          variant: "default",
          title: "Success",
          description: "Task has been updated successfully",
        });
      } else {
        const newTasks = await createTask(formData);
        if (setTasks) {
          setTasks((prevTasks) => [...newTasks, ...prevTasks]);
        }
        invalidateTaskQueries();
        toast({
          variant: "default",
          title: "Successfully created task(s)",
          description: `${newTasks.length} task(s) created successfully`,
        });
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
        title: "An error occurred, please try again",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecurringUpdate = async (updateSeries: boolean) => {
    if (!formData || !task) return;

    try {
      setIsLoading(true);
      const updatedTask = await updateTask(task.id, {
        ...formData,
        update_series: updateSeries,
      });
      if (setTasks) {
        setTasks(updatedTask);
      }
      invalidateTaskQueries();
      toast({
        variant: "default",
        title: "Success",
        description: `Task has been updated successfully${
          updateSeries ? " along with its series" : ""
        }`,
      });
      setIsOpen(false);
      if (onClose) onClose();
    } catch (error) {
      let errorMessage = "Failed to update task. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "An error occurred, please try again",
        description: errorMessage,
      });
    } finally {
      setShowRecurringDialog(false);
      setFormData(null);
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      const errorMessages = Object.values(errors).map((error) => error.message);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessages.join(", "),
      });
    },
  );

  const handleAISuggestion = async () => {
    const residentId = form.getValues("residents")[0];
    if (!residentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a resident first",
      });
      return;
    }

    try {
      setIsAILoading(true);
      const suggestion = await getAITaskSuggestion(residentId);

      const newPrefilledFields: Record<string, string> = {};

      if (suggestion.task_title) {
        form.setValue("task_title", suggestion.task_title);
        newPrefilledFields.task_title =
          "AI suggested based on resident's history";
      }

      if (suggestion.task_details) {
        form.setValue("task_details", suggestion.task_details);
        newPrefilledFields.task_details =
          "AI suggested based on resident's medical history";
      }

      if (suggestion.category) {
        form.setValue("category", suggestion.category);
        newPrefilledFields.category =
          "AI suggested based on task type analysis";
      }

      if (suggestion.priority) {
        form.setValue("priority", suggestion.priority);
        newPrefilledFields.priority =
          "AI suggested based on urgency assessment";
      }

      if (suggestion.start_date) {
        form.setValue("start_date", new Date(suggestion.start_date));
        newPrefilledFields.start_date = "AI suggested based on optimal timing";
      }

      if (suggestion.due_date) {
        form.setValue("due_date", new Date(suggestion.due_date));
        newPrefilledFields.due_date = "AI suggested based on task duration";
      }

      setPrefilledFields(newPrefilledFields);

      toast({
        title: "Success",
        description: "AI suggestion applied!",
      });
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI suggestion",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {!task && !open && (
            <Button>
              <Plus className="w-4 h-4 mr-1" /> New Task
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="min-h-fit max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {task ? "Edit Task" : "Create New Task"}
              </DialogTitle>
              {!task && (
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAISuggestion}
                    disabled={isAILoading || !canProceed}
                    className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 hover:text-green-500 transition-all hover:duration-300"
                  >
                    {isAILoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                        Getting Suggestion...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-green-500" />
                        Get AI Suggestion
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-col h-fit">
              {!task && (
                <div className="bg-slate-50 px-6 py-3 border-y">
                  <div className="flex flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="residents"
                      render={({ field, fieldState }) => (
                        <FormItem className="w-full">
                          <Label className="font-semibold">
                            Select Resident
                          </Label>
                          <Select
                            onValueChange={(value) => field.onChange([value])}
                            defaultValue={field.value?.[0]}
                            disabled={!!defaultResident}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  fieldState.invalid
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "",
                                )}
                              >
                                <SelectValue placeholder="Select a resident" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {residents.map((resident) => (
                                <SelectItem
                                  key={resident.id}
                                  value={resident.id}
                                >
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

                    <FormField
                      control={form.control}
                      name="assigned_to"
                      render={({ field, fieldState }) => (
                        <FormItem className="w-full">
                          <Label className="font-semibold">Assigned To</Label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  fieldState.invalid
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "",
                                )}
                              >
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
                  </div>
                </div>
              )}

              {!task && !canProceed && (
                <div className="flex flex-col items-center justify-center bg-slate-50 p-6">
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg max-w-md text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Select Required Fields
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Please select both a resident and a nurse to continue
                      creating a task.
                    </p>
                    <ChevronsDown className="h-6 w-6 text-amber-500 mx-auto animate-bounce" />
                  </div>
                </div>
              )}

              {(task || canProceed) && (
                <>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="task_title"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label>Task Title</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Input
                                    id="task_title"
                                    placeholder="Task Title"
                                    {...field}
                                    className={cn(
                                      fieldState.invalid
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "",
                                      prefilledFields.task_title
                                        ? "border-green-500 bg-green-50"
                                        : "",
                                    )}
                                  />
                                </div>
                              </TooltipTrigger>
                              {prefilledFields.task_title && (
                                <TooltipContent>
                                  <p>✶ {prefilledFields.task_title}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Textarea
                                    id="task_details"
                                    placeholder="Task Details"
                                    {...field}
                                    className={cn(
                                      fieldState.invalid
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "",
                                      prefilledFields.task_details
                                        ? "border-green-500 bg-green-50"
                                        : "",
                                    )}
                                  />
                                </div>
                              </TooltipTrigger>
                              {prefilledFields.task_details && (
                                <TooltipContent>
                                  <p>✶ {prefilledFields.task_details}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
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
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Label>Priority</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative">
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || ""}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          fieldState.invalid
                                            ? "border-destructive focus-visible:ring-destructive"
                                            : "",
                                          prefilledFields.priority
                                            ? "border-green-500 bg-green-50"
                                            : "",
                                        )}
                                      >
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="High">
                                          High
                                        </SelectItem>
                                        <SelectItem value="Medium">
                                          Medium
                                        </SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TooltipTrigger>
                                {prefilledFields.priority && (
                                  <TooltipContent>
                                    <p>✶ {prefilledFields.priority}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Label>Category</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative">
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || ""}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          fieldState.invalid
                                            ? "border-destructive focus-visible:ring-destructive"
                                            : "",
                                          prefilledFields.category
                                            ? "border-green-500 bg-green-50"
                                            : "",
                                        )}
                                      >
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Meals">
                                          Meals
                                        </SelectItem>
                                        <SelectItem value="Medication">
                                          Medication
                                        </SelectItem>
                                        <SelectItem value="Therapy">
                                          Therapy
                                        </SelectItem>
                                        <SelectItem value="Outing">
                                          Outing
                                        </SelectItem>
                                        <SelectItem value="Others">
                                          Others
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TooltipTrigger>
                                {prefilledFields.category && (
                                  <TooltipContent>
                                    <p>✶ {prefilledFields.category}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </FormItem>
                        )}
                      />
                    </div>

                    {task && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="residents"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <Label>Residents</Label>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange([value])
                                }
                                defaultValue={field.value?.[0]}
                                disabled={!!defaultResident}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      fieldState.invalid
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "",
                                    )}
                                  >
                                    <SelectValue placeholder="Select a resident" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {residents.map((resident) => (
                                    <SelectItem
                                      key={resident.id}
                                      value={resident.id}
                                    >
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
                                  <SelectTrigger
                                    className={cn(
                                      fieldState.invalid
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "",
                                    )}
                                  >
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
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Label>Start Date</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "rounded-md relative",
                                      prefilledFields.start_date
                                        ? "border border-green-500 bg-green-50"
                                        : "",
                                    )}
                                  >
                                    <DateTimePicker
                                      value={field.value}
                                      onChange={(date) => {
                                        if (date) {
                                          const newDate = new Date(date);
                                          if (field.value) {
                                            newDate.setHours(
                                              field.value.getHours(),
                                            );
                                            newDate.setMinutes(
                                              field.value.getMinutes(),
                                            );
                                          }
                                          field.onChange(newDate);
                                        }
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                {prefilledFields.start_date && (
                                  <TooltipContent>
                                    <p>✶ {prefilledFields.start_date}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Label>Due Date</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "rounded-md relative",
                                      prefilledFields.due_date
                                        ? "border border-green-500 bg-green-50"
                                        : "",
                                    )}
                                  >
                                    <DateTimePicker
                                      value={field.value}
                                      onChange={(date) => {
                                        if (date) {
                                          const newDate = new Date(date);
                                          if (field.value) {
                                            newDate.setHours(
                                              field.value.getHours(),
                                            );
                                            newDate.setMinutes(
                                              field.value.getMinutes(),
                                            );
                                          }
                                          field.onChange(newDate);
                                        }
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                {prefilledFields.due_date && (
                                  <TooltipContent>
                                    <p>✶ {prefilledFields.due_date}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurring"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Label>Recurring</Label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <SelectTrigger
                                className={
                                  fieldState.invalid
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Select recurrence" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Annually">
                                  Annually
                                </SelectItem>
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                      fieldState.invalid &&
                                        "border-destructive focus-visible:ring-destructive",
                                    )}
                                    disabled={!form.watch("recurring")}
                                  >
                                    {field.value ? (
                                      format(field.value, "MMMM do, yyyy")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => {
                                    if (!date) {
                                      field.onChange(null);
                                      return;
                                    }

                                    const selectedDate = new Date(
                                      date.getFullYear(),
                                      date.getMonth(),
                                      date.getDate(),
                                      8,
                                      0,
                                      0,
                                    );

                                    field.onChange(selectedDate);
                                  }}
                                  disabled={(date) =>
                                    form.getValues("due_date")
                                      ? date < form.getValues("due_date")
                                      : false
                                  }
                                />
                              </PopoverContent>
                            </Popover>
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
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value || ""}
                              className={
                                fieldState.invalid
                                  ? "border-destructive focus-visible:ring-destructive"
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
                  <div className="flex justify-end px-6 py-4 bg-background">
                    <Button type="submit" disabled={isLoading || isAILoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {task ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>{task ? "Update Task" : "Create Task"}</>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showRecurringDialog}
        onOpenChange={setShowRecurringDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Recurring Task</AlertDialogTitle>
            <AlertDialogDescription>
              This is a recurring task. Would you like to update just this task
              or all tasks in the series?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="default"
              onClick={() => handleRecurringUpdate(false)}
            >
              Update This Task
            </Button>
            <Button
              variant="default"
              onClick={() => handleRecurringUpdate(true)}
            >
              Update Entire Series
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
