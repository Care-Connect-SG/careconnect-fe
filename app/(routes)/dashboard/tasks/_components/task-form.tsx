"use client";

import { getResidents } from "@/app/api/resident";
import { createTask, updateTask, getAiTaskSuggestion, getEnhancedAiTaskSuggestion } from "@/app/api/task";
import { getAllNurses } from "@/app/api/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogClose,
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
import { AlertCircle, Plus, Sparkles } from "lucide-react";
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
    is_urgent: z.boolean().default(false),
    needs_attention: z.boolean().default(false),
    ai_recommendation_reason: z.string().optional(),
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

export type TaskForm = z.infer<typeof taskSchema> & {
  recommended_nurse_id?: string;
};

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
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [formData, setFormData] = useState<TaskForm | null>(null);
  const [isAiSuggestionEnabled, setIsAiSuggestionEnabled] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [recommendedNurse, setRecommendedNurse] = useState<string | null>(null);
  const [isAdvancedAi, setIsAdvancedAi] = useState(false);

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
      is_urgent: false,
      needs_attention: false,
      ai_recommendation_reason: "",
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
        start_date: new Date(task.start_date + "Z"),
        due_date: new Date(task.due_date + "Z"),
        recurring: task.recurring,
        end_recurring_date: task.end_recurring_date
          ? new Date(task.end_recurring_date + "Z")
          : undefined,
        remind_prior: task.remind_prior,
        is_ai_generated: task.is_ai_generated,
        is_urgent: task.is_urgent || false,
        needs_attention: task.needs_attention || false,
        ai_recommendation_reason: task.ai_recommendation_reason || "",
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
    }
  };

  const handleRecurringUpdate = async (updateSeries: boolean) => {
    if (!formData || !task) return;

    try {
      const updatedTask = await updateTask(task.id, {
        ...formData,
        update_series: updateSeries,
      });
      if (setTasks) {
        setTasks(updatedTask);
      }
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
        title: "An error occured, please try again",
        description: errorMessage,
      });
    } finally {
      setShowRecurringDialog(false);
      setFormData(null);
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

  const handleAiSuggestion = async () => {
    setIsAiGenerating(true);
    try {
      const residentId = form.getValues("residents")?.[0];
      if (!residentId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a resident first",
        });
        return;
      }

      // Use either enhanced or basic AI suggestion based on user selection
      const suggestion = isAdvancedAi 
        ? await getEnhancedAiTaskSuggestion(residentId)
        : await getAiTaskSuggestion(residentId);
      
      // Set recommended nurse if available from enhanced AI
      if (suggestion.recommended_nurse_id) {
        setRecommendedNurse(suggestion.recommended_nurse_id);
      }
      
      // Update form with AI suggestion
      form.reset({
        ...form.getValues(),
        ...suggestion,
        residents: [residentId],
      });

      setIsAiSuggestionEnabled(true);
      toast({
        variant: "default",
        title: isAdvancedAi ? "Enhanced AI Suggestion Generated" : "AI Suggestion Generated",
        description: isAdvancedAi 
          ? "GPT-4o Mini has analyzed resident data and suggested personalized task details." 
          : "AI has suggested task details based on resident needs and caregiver workload.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {!task && !open && (
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6">
            <div className="flex justify-between items-center">
              <DialogTitle>
                {task ? "Edit Task" : "Create New Task"}
              </DialogTitle>
              <div className="flex items-center">
                {!task && (
                  <>
                    <div className="mr-4">
                      <label className="flex items-center text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAdvancedAi}
                          onChange={() => setIsAdvancedAi(!isAdvancedAi)}
                          className="mr-1"
                        />
                        Use Enhanced AI
                      </label>
                    </div>
                    <Button
                      size="sm"
                      variant={isAiSuggestionEnabled ? "default" : "outline"}
                      className={`mr-8 ${isAiSuggestionEnabled ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300" : ""}`}
                      onClick={handleAiSuggestion}
                      disabled={isAiGenerating}
                      title={isAdvancedAi 
                        ? "GPT-4o Mini will analyze resident history for personalized suggestions"
                        : "AI will suggest tasks based on care needs, urgency, and caregiver workload"
                      }
                    >
                      {isAiGenerating ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4">
                            <div className="h-full w-full rounded-full border-2 border-t-transparent border-emerald-700"></div>
                          </div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isAdvancedAi ? "Enhanced AI" : "AI Suggest"}
                        </>
                      )}
                    </Button>
                  </>
                )}
                <DialogClose className="absolute right-4 top-4"></DialogClose>
              </div>
            </div>
            <DialogDescription>
              {task
                ? "Edit the details of your task below."
                : "Fill in the details below to create a new task."}
            </DialogDescription>
            {isAiSuggestionEnabled && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-800">
                  AI has suggested task details based on care needs and workload
                  analysis.
                </span>
              </div>
            )}
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-[calc(90vh-8rem)]"
            >
              <div className="flex-1 overflow-y-auto px-6 space-y-4">
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
                          className={
                            fieldState.invalid
                              ? "border-destructive focus-visible:ring-destructive"
                              : form.watch("is_ai_generated")
                                ? "border-emerald-200 bg-emerald-50"
                                : ""
                          }
                        />
                      </FormControl>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                      {form.watch("is_ai_generated") && (
                        <p className="text-xs flex items-center gap-1 text-emerald-700 mt-1">
                          <Sparkles className="h-3 w-3" />
                          AI suggested based on resident care patterns
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
                          className={
                            fieldState.invalid
                              ? "border-destructive focus-visible:ring-destructive"
                              : form.watch("is_ai_generated")
                                ? "border-emerald-200 bg-emerald-50"
                                : ""
                          }
                        />
                      </FormControl>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                      {form.watch("is_ai_generated") && (
                        <p className="text-xs flex items-center gap-1 text-emerald-700 mt-1">
                          <Sparkles className="h-3 w-3" />
                          AI suggested based on care requirements
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger
                            className={
                              fieldState.invalid
                                ? "border-destructive focus-visible:ring-destructive"
                                : form.watch("is_ai_generated")
                                  ? "border-emerald-200 bg-emerald-50"
                                  : ""
                            }
                          >
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.watch("is_ai_generated") && (
                          <p className="text-xs flex items-center gap-1 text-emerald-700 mt-1">
                            <Sparkles className="h-3 w-3" />
                            Suggested priority based on task impact
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label>Category</Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger
                            className={
                              fieldState.invalid
                                ? "border-destructive focus-visible:ring-destructive"
                                : form.watch("is_ai_generated")
                                  ? "border-emerald-200 bg-emerald-50"
                                  : ""
                            }
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Meals">Meals</SelectItem>
                            <SelectItem value="Medication">
                              Medication
                            </SelectItem>
                            <SelectItem value="Therapy">Therapy</SelectItem>
                            <SelectItem value="Outing">Outing</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.watch("is_ai_generated") && (
                          <p className="text-xs flex items-center gap-1 text-emerald-700 mt-1">
                            <Sparkles className="h-3 w-3" />
                            Selected based on resident's care plan needs
                          </p>
                        )}
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
                          <SelectTrigger
                            className={
                              fieldState.invalid
                                ? "border-destructive focus-visible:ring-destructive"
                                : field.value && field.value === recommendedNurse
                                  ? "border-emerald-200 bg-emerald-50"
                                  : ""
                            }
                          >
                            <SelectValue placeholder="Select a nurse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nurses.map((nurse) => (
                            <SelectItem
                              key={nurse.id}
                              value={nurse.id}
                              style={
                                recommendedNurse === nurse.id
                                  ? { background: "#ecfdf5", fontWeight: 500 }
                                  : {}
                              }
                            >
                              {nurse.name} ({nurse.email})
                              {recommendedNurse === nurse.id &&
                                " ✓ Recommended"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                      {form.watch("is_ai_generated") &&
                        recommendedNurse === field.value && (
                          <p className="text-xs flex items-center gap-1 text-emerald-700 mt-1">
                            <Sparkles className="h-3 w-3" />
                            Recommended based on current workload
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
                          <SelectTrigger
                            className={
                              fieldState.invalid
                                ? "border-destructive focus-visible:ring-destructive"
                                : form.watch("is_ai_generated")
                                  ? "border-emerald-200 bg-emerald-50"
                                  : ""
                            }
                          >
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
                      {form.watch("is_ai_generated") && (
                        <p className="text-xs flex items-center gap-1 text-emerald-700 mt-1">
                          <Sparkles className="h-3 w-3" />
                          Pre-filled based on care schedule analysis
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
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
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
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
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
                                ? new Date(field.value)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
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
                {form.watch("is_ai_generated") &&
                  form.watch("ai_recommendation_reason") && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm">
                      <div className="font-medium flex items-center gap-2 text-emerald-800 mb-1">
                        <Sparkles className="h-4 w-4" />
                        AI Recommendation Summary
                      </div>
                      <p className="text-emerald-700">
                        {form.watch("ai_recommendation_reason")}
                      </p>
                    </div>
                  )}
              </div>
              <div className="flex justify-end px-6 py-4 border-t bg-background">
                <Button type="submit">
                  {task ? "Update Task" : "Create Task"}
                </Button>
              </div>
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
