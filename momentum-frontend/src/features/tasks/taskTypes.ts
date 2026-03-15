export type TaskFrequency = "daily" | "weekly" | "monthly";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  name: string;
  description?: string;
  priority: TaskPriority;
  frequency: TaskFrequency;
  reminder: boolean;
  reminderOffsetDays?: number;
  scheduledDate: string;
  scheduledTime: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskPayload = Omit<Task, "id" | "createdAt" | "updatedAt">;
