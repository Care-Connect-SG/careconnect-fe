export enum TaskStatus {
  ASSIGNED = "Assigned",
  COMPLETED = "Completed",
  DELAYED = "Delayed",
  REQUEST_REASSIGNMENT = "Request Reassignment",
}

export enum TaskPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum TaskCategory {
  MEALS = "Meals",
  MEDICATION = "Medication",
  THERAPY = "Therapy",
  OUTING = "Outing",
}

export enum Recurrence {
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  ANNUALLY = "Annually",
}

export interface TaskBase {
  task_title: string;
  task_details?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to: string[];
  resident: string;
  created_by: string;
  created_at: string;
  start_date?: string;
  due_date?: string;
  recurring?: Recurrence;
  end_recurring_date?: string;
  remind_prior?: number;
  finished_at?: string;
  media?: string[];
  notes?: string;
  is_ai_generated: boolean;
}

export interface TaskCreate extends TaskBase {}

export interface Task extends TaskBase {
  id?: string;
}
