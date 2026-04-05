import { TASK_PRIORITY_XP } from "@/features/gamification/gamificationDisplay";
import {
  generateTaskOccurrencesForMonth,
  generateTaskOccurrencesForRange,
  toOccurrenceDateTime,
} from "@/features/tasks/taskRecurrence";
import type { Task, TaskFrequency, TaskOccurrence, TaskPriority } from "@/features/tasks/taskTypes";

export type TaskAnalyticsSummary = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  scheduledThisMonth: number;
  xpEarned: number;
  dueToday: number;
  overdueOpenTasks: number;
  upcomingOpenTasks: number;
};

export type TaskCompletionTrendPoint = {
  date: string;
  label: string;
  scheduled: number;
  completed: number;
  completionRate: number;
};

export type TaskBreakdownPoint = {
  label: string;
  count: number;
  share: number;
};

export type TaskAnalyticsHighlights = {
  busiestWeekdayLabel: string;
  busiestWeekdayCount: number;
  topPriorityLabel: string;
  topPriorityCount: number;
  nextUpcomingTaskLabel: string;
  nextUpcomingTaskTime: string;
  overdueOpenTasks: number;
  xpEarned: number;
};

export type TaskAnalyticsResult = {
  summary: TaskAnalyticsSummary;
  trend: TaskCompletionTrendPoint[];
  frequencyBreakdown: TaskBreakdownPoint[];
  priorityBreakdown: TaskBreakdownPoint[];
  weekdayBreakdown: TaskBreakdownPoint[];
  highlights: TaskAnalyticsHighlights;
};

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const FREQUENCY_LABELS: Record<TaskFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatTimeLabel = (value: string) => {
  const [hourText, minuteText = "00"] = value.split(":");
  const hour = Number(hourText);

  if (Number.isNaN(hour)) return value;

  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  const meridiem = hour >= 12 ? "PM" : "AM";

  return `${normalizedHour}:${minuteText} ${meridiem}`;
};

const createBreakdown = (
  entries: Array<{ label: string; count: number }>,
): TaskBreakdownPoint[] => {
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);

  return entries.map((entry) => ({
    label: entry.label,
    count: entry.count,
    share: total > 0 ? Math.round((entry.count / total) * 100) : 0,
  }));
};

export const getTaskAnalytics = (
  tasks: Task[],
  now: Date = new Date(),
  trendDays = 14,
): TaskAnalyticsResult => {
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayValue = formatDateValue(todayDate);
  const monthOccurrences = generateTaskOccurrencesForMonth(
    tasks,
    todayDate.getFullYear(),
    todayDate.getMonth(),
  );

  const completedTasks = monthOccurrences.filter((task) => task.completed).length;
  const completionRate =
    monthOccurrences.length > 0
      ? Math.round((completedTasks / monthOccurrences.length) * 100)
      : 0;
  const xpEarned = monthOccurrences.reduce((sum, task) => {
    if (!task.completed) return sum;
    return sum + TASK_PRIORITY_XP[task.priority];
  }, 0);

  const scheduledThisMonth = monthOccurrences.length;

  const trendStart = new Date(todayDate);
  trendStart.setDate(todayDate.getDate() - (trendDays - 1));
  const analyticsWindowStart =
    trendStart.getTime() < new Date(todayDate.getFullYear(), todayDate.getMonth(), 1).getTime()
      ? trendStart
      : new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const analyticsWindowEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
  const windowOccurrences = generateTaskOccurrencesForRange(
    tasks,
    analyticsWindowStart,
    analyticsWindowEnd,
  );

  const dueToday = monthOccurrences.filter((task) => task.scheduledDate === todayValue).length;
  const overdueOpenTasks = windowOccurrences.filter((task) => {
    if (task.completed) return false;
    const scheduledAt = toOccurrenceDateTime(task);
    return scheduledAt !== null && scheduledAt.getTime() < now.getTime();
  }).length;
  const upcomingOpenTasks = windowOccurrences.filter((task) => {
    if (task.completed) return false;
    const scheduledAt = toOccurrenceDateTime(task);
    return scheduledAt !== null && scheduledAt.getTime() >= now.getTime();
  }).length;

  const trend = Array.from({ length: trendDays }, (_, index) => {
    const date = new Date(trendStart);
    date.setDate(trendStart.getDate() + index);
    const dateValue = formatDateValue(date);
    const scheduled = windowOccurrences.filter((task) => task.scheduledDate === dateValue).length;
    const completed = windowOccurrences.filter(
      (task) => task.scheduledDate === dateValue && task.completed,
    ).length;

    return {
      date: dateValue,
      label: formatDateLabel(date),
      scheduled,
      completed,
      completionRate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
    };
  });

  const frequencyBreakdown = createBreakdown(
    (Object.keys(FREQUENCY_LABELS) as TaskFrequency[]).map((frequency) => ({
      label: FREQUENCY_LABELS[frequency],
      count: monthOccurrences.filter((task) => task.frequency === frequency).length,
    })),
  );

  const priorityBreakdown = createBreakdown(
    (Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => ({
      label: PRIORITY_LABELS[priority],
      count: monthOccurrences.filter((task) => task.priority === priority).length,
    })),
  );

  const weekdayBreakdown = createBreakdown(
    WEEKDAY_LABELS.map((label, dayIndex) => ({
      label,
      count: monthOccurrences.filter((task) => {
        const [year, month, day] = task.scheduledDate.split("-").map(Number);
        if (!year || !month || !day) return false;
        return new Date(year, month - 1, day).getDay() === dayIndex;
      }).length,
    })),
  );

  const busiestWeekday =
    [...weekdayBreakdown].sort((left, right) => right.count - left.count)[0] ?? null;
  const topPriority =
    [...priorityBreakdown].sort((left, right) => right.count - left.count)[0] ?? null;
  const nextUpcomingTask =
    [...windowOccurrences]
      .filter((task) => !task.completed)
      .map((task) => ({
        task,
        scheduledAt: toOccurrenceDateTime(task),
      }))
      .filter(
        (entry): entry is { task: TaskOccurrence; scheduledAt: Date } =>
          entry.scheduledAt !== null && entry.scheduledAt.getTime() >= now.getTime(),
      )
      .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime())[0] ??
    null;

  return {
    summary: {
      totalTasks: monthOccurrences.length,
      completedTasks,
      completionRate,
      scheduledThisMonth,
      xpEarned,
      dueToday,
      overdueOpenTasks,
      upcomingOpenTasks,
    },
    trend,
    frequencyBreakdown,
    priorityBreakdown,
    weekdayBreakdown,
    highlights: {
      busiestWeekdayLabel: busiestWeekday?.label ?? "No schedule yet",
      busiestWeekdayCount: busiestWeekday?.count ?? 0,
      topPriorityLabel: topPriority?.label ?? "No tasks yet",
      topPriorityCount: topPriority?.count ?? 0,
      nextUpcomingTaskLabel: nextUpcomingTask?.task.name ?? "Nothing upcoming",
      nextUpcomingTaskTime: nextUpcomingTask
        ? `${nextUpcomingTask.task.scheduledDate} · ${formatTimeLabel(nextUpcomingTask.task.scheduledTime)}`
        : "Add a scheduled task to see it here",
      overdueOpenTasks,
      xpEarned,
    },
  };
};
