import type { PomodoroDashboard } from "@/features/pomodoro/pomodoroApiSlice";
import type { Habit } from "@/features/habit/habitApiSlice";
import { getHabitDashboardMetrics, type HabitDashboardMetrics } from "@/features/habit/habitMetrics";
import { getTaskAnalytics, type TaskAnalyticsResult } from "@/features/tasks/taskAnalytics";
import { formatTaskDateValue, generateTaskOccurrencesForRange, toOccurrenceDateTime } from "@/features/tasks/taskRecurrence";
import type { Task, TaskOccurrence } from "@/features/tasks/taskTypes";

const LOOK_AHEAD_DAYS = 5;
const TODAY_QUEUE_LIMIT = 3;

export type HomeAttentionItem = {
  id: string;
  badge: string;
  title: string;
  detail: string;
  actionHref: string;
  actionKind: "route" | "anchor";
  actionLabel: string;
};

export type HomeSummaryStat = {
  label: string;
  value: string;
};

export type HomeOverviewData = {
  todayValue: string;
  habitMetrics: HabitDashboardMetrics;
  taskAnalytics: TaskAnalyticsResult;
  focusMinutes: number | null;
  focusSessions: number | null;
  nextTask: TaskOccurrence | null;
  todayQueue: TaskOccurrence[];
  summaryStats: HomeSummaryStat[];
  quickStats: HomeSummaryStat[];
  attentionItems: HomeAttentionItem[];
};

const getTodayQueue = (tasks: TaskOccurrence[]) => {
  return [...tasks]
    .sort((left, right) => {
      if (left.completed !== right.completed) {
        return Number(left.completed) - Number(right.completed);
      }

      const timeCompare = left.scheduledTime.localeCompare(right.scheduledTime);
      if (timeCompare !== 0) return timeCompare;
      return left.name.localeCompare(right.name);
    })
    .slice(0, TODAY_QUEUE_LIMIT);
};

export const formatHomeTaskDayLabel = (
  task: TaskOccurrence,
  todayValue: string,
  now: Date,
) => {
  if (task.occurrenceDate === todayValue) {
    const scheduledAt = toOccurrenceDateTime(task);
    if (scheduledAt && scheduledAt.getTime() < now.getTime() && !task.completed) {
      return "Late today";
    }
    return "Today";
  }

  const [year, month, day] = task.occurrenceDate.split("-").map(Number);
  if (!year || !month || !day) return task.occurrenceDate;

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const getHomeOverviewData = ({
  habits,
  hasHabitError,
  tasks,
  hasTaskError,
  pomodoroDashboard,
  hasPomodoroError,
  now,
}: {
  habits: Habit[];
  hasHabitError: boolean;
  tasks: Task[];
  hasTaskError: boolean;
  pomodoroDashboard?: PomodoroDashboard;
  hasPomodoroError: boolean;
  now: Date;
}): HomeOverviewData => {
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayValue = formatTaskDateValue(todayDate);
  const endDate = new Date(todayDate);
  endDate.setDate(endDate.getDate() + LOOK_AHEAD_DAYS);

  const habitMetrics = getHabitDashboardMetrics(habits);
  const taskAnalytics = getTaskAnalytics(tasks, now);
  const todaysTasks = generateTaskOccurrencesForRange(tasks, todayDate, todayDate);
  const openTodayTasks = todaysTasks.filter((task) => !task.completed);
  const todayQueue = getTodayQueue(todaysTasks);

  const upcomingOpenTasks = generateTaskOccurrencesForRange(tasks, todayDate, endDate)
    .filter((task) => !task.completed);

  const nextTask =
    upcomingOpenTasks.find((task) => {
      const scheduledAt = toOccurrenceDateTime(task);
      return scheduledAt === null || scheduledAt.getTime() >= now.getTime();
    }) ??
    upcomingOpenTasks[0] ??
    null;

  const habitsLeftToday = hasHabitError ? null : habitMetrics.habitsLeftForPerfectDay;
  const overdueTasks = hasTaskError ? null : taskAnalytics.summary.overdueOpenTasks;
  const focusMinutes = hasPomodoroError ? null : pomodoroDashboard?.stats.focusMinutes ?? 0;
  const focusSessions =
    hasPomodoroError ? null : pomodoroDashboard?.stats.sessionsCompleted ?? 0;

  const summaryStats = [
    { label: "Habits left", value: habitsLeftToday === null ? "--" : `${habitsLeftToday}` },
    { label: "Open today", value: hasTaskError ? "--" : `${openTodayTasks.length}` },
    { label: "Focus minutes", value: focusMinutes === null ? "--" : `${focusMinutes}m` },
  ];

  const quickStats = [
    { label: "Current streak", value: hasHabitError ? "--" : `${habitMetrics.maxStreak} days` },
    { label: "Focus sessions", value: focusSessions === null ? "--" : `${focusSessions}` },
    {
      label: "Task XP",
      value: hasTaskError ? "--" : `${taskAnalytics.summary.xpEarned} XP`,
    },
  ];

  const attentionItems: HomeAttentionItem[] = [];

  if (typeof overdueTasks === "number" && overdueTasks > 0) {
    attentionItems.push({
      id: "overdue",
      badge: `${overdueTasks} overdue`,
      title: "Clear overdue tasks first",
      detail:
        overdueTasks === 1
          ? "One task is already past due. Clearing it now will make the rest of the day easier to manage."
          : `${overdueTasks} tasks are already overdue, so clearing them first will reduce pressure quickly.`,
      actionHref: "/task-calendar",
      actionKind: "route",
      actionLabel: "Open tasks",
    });
  }

  if (typeof habitsLeftToday === "number" && habitsLeftToday > 0) {
    attentionItems.push({
      id: "habits",
      badge: `${habitsLeftToday} left`,
      title: "Finish your remaining habits",
      detail: habitMetrics.nearestHabit
        ? `${habitMetrics.nearestHabit.habitName} is the closest habit to done, so it is a good place to start.`
        : "A quick pass through your habit list will move the day forward.",
      actionHref: "#today-habits",
      actionKind: "anchor",
      actionLabel: "See habits",
    });
  }

  if (!hasTaskError && openTodayTasks.length > 0) {
    attentionItems.push({
      id: "today-tasks",
      badge: `${openTodayTasks.length} open today`,
      title: "Close out today’s task queue",
      detail: nextTask
        ? `${nextTask.name} is the next scheduled task on deck.`
        : "A short pass through today’s tasks will keep the queue from carrying over.",
      actionHref: "/task-calendar",
      actionKind: "route",
      actionLabel: "View queue",
    });
  }

  return {
    todayValue,
    habitMetrics,
    taskAnalytics,
    focusMinutes,
    focusSessions,
    nextTask,
    todayQueue,
    summaryStats,
    quickStats,
    attentionItems: attentionItems.slice(0, 3),
  };
};
