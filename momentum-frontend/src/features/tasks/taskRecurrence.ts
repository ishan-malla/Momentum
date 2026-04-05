import type { Task, TaskCompletionHistory, TaskFrequency, TaskOccurrence } from "@/features/tasks/taskTypes";
import { parseTaskDateParts } from "@/features/tasks/taskDateUtils";

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTaskDateValue = (date: Date) => formatDateValue(date);

const getMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const offsetFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offsetFromMonday);
  return start;
};

export const getTaskWeekStart = (date: Date) => getStartOfWeek(date);

export const getTaskWeekEnd = (date: Date) => {
  const end = getStartOfWeek(date);
  end.setDate(end.getDate() + 6);
  return end;
};

const toDateFromValue = (value: string) => {
  const parts = parseTaskDateParts(value);
  if (!parts) return null;
  return new Date(parts.year, parts.month, parts.day);
};

const toTaskDateTime = (dateValue: string, timeValue: string) => {
  const parsed = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const getOccurrenceKeyForDate = (
  frequency: TaskFrequency,
  occurrenceDate: string,
) => {
  const date = toDateFromValue(occurrenceDate);
  if (!date) return occurrenceDate;

  if (frequency === "daily") return occurrenceDate;
  if (frequency === "monthly") return getMonthKey(date);
  return formatDateValue(getStartOfWeek(date));
};

export const getTaskCompletionHistory = (task: Task): TaskCompletionHistory => {
  return task.completionHistory ?? {};
};

export const getTaskOccurrenceCompletion = (task: Task, occurrenceDate: string) => {
  const occurrenceKey = getOccurrenceKeyForDate(task.frequency, occurrenceDate);
  const completedAt = getTaskCompletionHistory(task)[occurrenceKey];

  return {
    occurrenceKey,
    completed: Boolean(completedAt),
    completedAt,
  };
};

const doesTaskOccurOnDate = (task: Task, date: Date) => {
  const anchorDate = toDateFromValue(task.scheduledDate);
  if (!anchorDate) return false;

  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedAnchor = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate(),
  );

  if (normalizedDate.getTime() < normalizedAnchor.getTime()) return false;

  if (task.frequency === "daily") return true;
  if (task.frequency === "weekly") {
    return normalizedDate.getDay() === normalizedAnchor.getDay();
  }

  return normalizedDate.getDate() === normalizedAnchor.getDate();
};

export const createTaskOccurrence = (
  task: Task,
  occurrenceDate: string,
): TaskOccurrence | null => {
  const date = toDateFromValue(occurrenceDate);
  if (!date || !doesTaskOccurOnDate(task, date)) return null;

  const completion = getTaskOccurrenceCompletion(task, occurrenceDate);

  return {
    id: `${task.id}:${completion.occurrenceKey}`,
    taskId: task.id,
    name: task.name,
    description: task.description ?? "",
    priority: task.priority,
    frequency: task.frequency,
    completed: completion.completed,
    completedAt: completion.completedAt,
    reminder: task.reminder,
    reminderOffsetDays: task.reminderOffsetDays ?? 0,
    scheduledDate: occurrenceDate,
    scheduledTime: task.scheduledTime,
    occurrenceDate,
    occurrenceKey: completion.occurrenceKey,
    baseTask: task,
  };
};

export const generateTaskOccurrencesForRange = (
  tasks: Task[],
  startDate: Date,
  endDate: Date,
): TaskOccurrence[] => {
  const normalizedStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const normalizedEnd = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  const occurrences: TaskOccurrence[] = [];

  tasks.forEach((task) => {
    const anchorDate = toDateFromValue(task.scheduledDate);
    if (!anchorDate) return;

    const cursor = new Date(
      Math.max(anchorDate.getTime(), normalizedStart.getTime()),
    );
    cursor.setHours(0, 0, 0, 0);

    while (cursor.getTime() <= normalizedEnd.getTime()) {
      if (doesTaskOccurOnDate(task, cursor)) {
        const occurrence = createTaskOccurrence(task, formatDateValue(cursor));
        if (occurrence) occurrences.push(occurrence);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return occurrences.sort((left, right) => {
    const dateCompare = left.scheduledDate.localeCompare(right.scheduledDate);
    if (dateCompare !== 0) return dateCompare;
    const timeCompare = left.scheduledTime.localeCompare(right.scheduledTime);
    if (timeCompare !== 0) return timeCompare;
    return left.name.localeCompare(right.name);
  });
};

export const generateTaskOccurrencesForMonth = (
  tasks: Task[],
  year: number,
  month: number,
) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return generateTaskOccurrencesForRange(tasks, startDate, endDate);
};

export const toOccurrenceDateTime = (occurrence: TaskOccurrence) => {
  return toTaskDateTime(occurrence.occurrenceDate, occurrence.scheduledTime);
};
