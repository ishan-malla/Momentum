import type { Task } from "@/features/tasks/taskTypes";
import { parseTaskDateParts } from "@/features/tasks/taskDateUtils";

const startOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const endOfWeek = (date: Date) => {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  return end;
};

export const canCompleteTask = (task: Task, now: Date = new Date()) => {
  const parts = parseTaskDateParts(task.scheduledDate);
  if (!parts) return false;

  const taskDate = new Date(parts.year, parts.month, parts.day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (task.frequency === "daily") {
    return (
      taskDate.getFullYear() === today.getFullYear() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getDate() === today.getDate()
    );
  }

  if (task.frequency === "weekly") {
    const weekStart = startOfWeek(taskDate);
    const weekEnd = endOfWeek(taskDate);
    return today >= weekStart && today <= weekEnd;
  }

  return (
    taskDate.getFullYear() === today.getFullYear() &&
    taskDate.getMonth() === today.getMonth()
  );
};
