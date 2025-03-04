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

export interface Task {
  id: string;
  task_title: string;
  task_details?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to: string;
  residents: string[];
  created_by: string;
  created_at: Date;
  start_date: Date;
  due_date: Date;
  recurring?: Recurrence;
  end_recurring_date?: Date;
  remind_prior?: number;
  finished_at?: Date;
  media?: string[];
  notes?: string;
  is_ai_generated: boolean;
}
