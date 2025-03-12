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

export interface TaskUpdate {
  task_title?: string;
  task_details?: string;
  media?: string[];
  notes?: string;
  status?: TaskStatus;
  priority?: string;
  category?: string;
  residents?: string[];
  start_date?: string;
  due_date?: string;
  recurring?: string;
  end_recurring_date?: string;
  remind_prior?: number;
  is_ai_generated?: boolean;
  assigned_to?: string;
}

export interface Task {
  id: string;
  task_title: string;
  task_details?: string;
  media?: string[];
  notes?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  start_date: Date;
  due_date: Date;
  recurring?: Recurrence;
  end_recurring_date?: Date;
  remind_prior?: number;
  finished_at?: Date;
  is_ai_generated: boolean;
  created_at: Date;
  assigned_to: string;
  assigned_to_name: string;
  resident: string;
  resident_name: string;
  resident_room: string;
  created_by: string;
}
