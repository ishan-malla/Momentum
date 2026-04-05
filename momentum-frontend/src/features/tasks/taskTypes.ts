export type TaskFrequency = "daily" | "weekly" | "monthly";
export type TaskPriority = "low" | "medium" | "high";
export type TaskCompletionHistory = Record<string, string>;

export type Task = {
  id: string;
  name: string;
  description?: string;
  priority: TaskPriority;
  frequency: TaskFrequency;
  completed: boolean;
  completedAt?: string;
  completionHistory: TaskCompletionHistory;
  reminder: boolean;
  reminderOffsetDays?: number;
  scheduledDate: string;
  scheduledTime: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskPayload = {
  name: string;
  description?: string;
  priority: TaskPriority;
  frequency: TaskFrequency;
  reminder: boolean;
  reminderOffsetDays?: number;
  scheduledDate: string;
  scheduledTime: string;
};

export type TaskOccurrence = {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  priority: TaskPriority;
  frequency: TaskFrequency;
  completed: boolean;
  completedAt?: string;
  reminder: boolean;
  reminderOffsetDays?: number;
  scheduledDate: string;
  scheduledTime: string;
  occurrenceDate: string;
  occurrenceKey: string;
  baseTask: Task;
};
