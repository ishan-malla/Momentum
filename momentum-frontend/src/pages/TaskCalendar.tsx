import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import XpActivityDisclosure from "@/components/gamification/XpActivityDisclosure";
import { Button } from "@/components/ui/button";
import TaskForm from "@/components/tasks/TaskForm";
import TaskPlannerItem from "@/components/tasks/TaskPlannerItem";
import TaskPlannerCalendar from "@/components/tasks/TaskPlannerCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { TASK_PRIORITY_XP } from "@/features/gamification/gamificationDisplay";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "@/features/tasks/taskApiSlice";
import type {
  TaskFrequency,
  TaskOccurrence,
  TaskPayload,
} from "@/features/tasks/taskTypes";
import { useCalendar } from "@/hooks/useCalendarHook";
import { canCompleteTask } from "@/features/tasks/taskCompletionUtils";
import {
  generateTaskOccurrencesForMonth,
  generateTaskOccurrencesForRange,
  getTaskWeekEnd,
  getTaskWeekStart,
} from "@/features/tasks/taskRecurrence";

type FrequencyFilter = "all" | TaskFrequency;

const LIST_FILTERS: FrequencyFilter[] = ["all", "daily", "weekly", "monthly"];

const taskXpItems = [
  {
    label: "Low Priority Task",
    value: `${TASK_PRIORITY_XP.low} XP`,
    detail: "Completing a low-priority task awards 5 XP.",
  },
  {
    label: "Medium Priority Task",
    value: `${TASK_PRIORITY_XP.medium} XP`,
    detail: "Completing a medium-priority task awards 10 XP.",
  },
  {
    label: "High Priority Task",
    value: `${TASK_PRIORITY_XP.high} XP`,
    detail: "Completing a high-priority task awards 15 XP.",
  },
  {
    label: "Undo Completion",
    value: "-same XP",
    detail: "If you mark a completed task incomplete again, that task's awarded XP is removed.",
  },
  {
    label: "Scheduled Window",
    value: "XP on completion",
    detail: "Tasks only award XP when they are completed during their allowed scheduled window.",
  },
];

const sortTasks = (tasks: TaskOccurrence[]) => {
  return [...tasks].sort((a, b) => {
    const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
    if (dateCompare !== 0) return dateCompare;
    const timeCompare = a.scheduledTime.localeCompare(b.scheduledTime);
    if (timeCompare !== 0) return timeCompare;
    return a.name.localeCompare(b.name);
  });
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") return fallback;

  if ("data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "error" in data) {
      const message = (data as { error?: string }).error;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: string }).message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }

  if ("error" in error) {
    const message = (error as { error?: unknown }).error;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

const normalizeDate = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const shiftMonth = (date: Date, direction: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + direction);
  return next;
};

const getListEmptyStateCopy = (filter: FrequencyFilter) => {
  if (filter === "all") return "No tasks yet. Add one to start planning.";
  return `No ${filter} tasks available right now.`;
};


const TaskCalendar = () => {
  const [listFilter, setListFilter] = useState<FrequencyFilter>("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());

  const { data: tasks = [], isLoading, isError } = useGetTasksQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const normalizedViewDate = useMemo(() => normalizeDate(viewDate), [viewDate]);
  const calendar = useCalendar({
    year: normalizedViewDate.getFullYear(),
    month: normalizedViewDate.getMonth(),
  });

  const visibleTasks = useMemo(() => {
    return sortTasks(
      generateTaskOccurrencesForMonth(
        tasks.filter((task) => task.frequency === "monthly"),
        normalizedViewDate.getFullYear(),
        normalizedViewDate.getMonth(),
      ),
    );
  }, [normalizedViewDate, tasks]);

  const taskListItems = useMemo(() => {
    const monthlyTasks = generateTaskOccurrencesForMonth(
      tasks.filter((task) => task.frequency === "monthly"),
      normalizedViewDate.getFullYear(),
      normalizedViewDate.getMonth(),
    );
    const weeklyTasks = generateTaskOccurrencesForRange(
      tasks.filter((task) => task.frequency === "weekly"),
      getTaskWeekStart(normalizedViewDate),
      getTaskWeekEnd(normalizedViewDate),
    );
    const dailyTasks = generateTaskOccurrencesForRange(
      tasks.filter((task) => task.frequency === "daily"),
      normalizedViewDate,
      normalizedViewDate,
    );

    const combined = sortTasks([...monthlyTasks, ...weeklyTasks, ...dailyTasks]);

    if (listFilter === "all") return combined;
    return combined.filter((task) => task.frequency === listFilter);
  }, [listFilter, normalizedViewDate, tasks]);

  const plannerTitle = `${calendar.monthName} ${calendar.year}`;

  const handlePrevPeriod = () => {
    setViewDate((previous) => shiftMonth(previous, -1));
  };

  const handleNextPeriod = () => {
    setViewDate((previous) => shiftMonth(previous, 1));
  };

  const handleToday = () => {
    setViewDate(new Date());
  };

  const handleCreate = async (values: TaskPayload) => {
    try {
      await createTask(values).unwrap();
      toast.success("Task created");
      setShowCreateForm(false);
    } catch (error: unknown) {
      console.error("Task creation failed", error);
      toast.error(getApiErrorMessage(error, "Task creation failed"));
    }
  };

  const handleUpdate = async (id: string, values: TaskPayload) => {
    try {
      await updateTask({ id, patch: values }).unwrap();
      setEditingTaskId(null);
      toast.success("Task updated");
    } catch (error: unknown) {
      console.error("Task update failed", error);
      toast.error(getApiErrorMessage(error, "Task update failed"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted");
    } catch (error: unknown) {
      console.error("Task delete failed", error);
      toast.error(getApiErrorMessage(error, "Task delete failed"));
    }
  };

  const handleToggleComplete = async (
    task: TaskOccurrence,
    nextCompleted: boolean,
  ) => {
    try {
      await updateTask({
        id: task.taskId,
        patch: { completed: nextCompleted, occurrenceDate: task.occurrenceDate },
      }).unwrap();
    } catch (error: unknown) {
      console.error("Task completion update failed", error);
      const fallback = nextCompleted
        ? "Task can only be completed during its scheduled window."
        : "Task update failed.";
      toast.error(getApiErrorMessage(error, fallback));
    }
  };

  return (
    <div className="animate-fade-in mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      <section className="relative animate-drop-in space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="space-y-1">
              <h1 className="font-heading text-[2.15rem] font-semibold tracking-[-0.03em] text-[#2f3e32]">
                Tasks & Calendar
              </h1>
              <p className="max-w-2xl text-sm text-[#7b7467]">
                Monthly tasks appear in the calendar, while the full task list
                stays below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XpActivityDisclosure
              title="Task XP Activity"
              subtitle="See how task completion awards XP based on priority."
              items={taskXpItems}
              footnote="These values match the current backend task reward rules."
            />
            <Button
              asChild
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-[#ddd6c8] bg-[#fffdfa] px-4 text-sm text-[#304034] shadow-none hover:bg-[#f6f1e8]"
            >
              <Link to="/task-calendar/analytics">Analytics</Link>
            </Button>
            {!showCreateForm ? (
              <Button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="h-10 rounded-xl bg-[#6f8d6e] px-4 text-sm text-white shadow-none hover:bg-[#5f7c5e]"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add task
              </Button>
            ) : null}
          </div>
        </div>

        {showCreateForm && (
          <div className="absolute inset-x-0 top-[5.25rem] z-30 flex justify-end">
            <div className="w-full max-w-2xl animate-drop-in rounded-[1.35rem] shadow-[0_22px_55px_rgba(57,52,43,0.18)]">
              <TaskForm
                title="Create task"
                submitLabel="Add task"
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
                isSubmitting={isCreating}
                disallowPastDateTime
              />
            </div>
          </div>
        )}

        <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
          <CardContent className="space-y-3 px-3 py-4 sm:px-4 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] border border-[#e7dfd2] bg-[#faf6ef] px-3 py-2.5 sm:px-4">
              <div>
                <p className="font-heading text-lg font-semibold text-[#2f3e32] sm:text-[1.55rem]">
                  {plannerTitle}
                </p>
                <p className="text-xs text-[#7b7467]">
                  {visibleTasks.length}{" "}
                  {visibleTasks.length === 1 ? "monthly task is" : "monthly tasks are"}{" "}
                  visible in this month.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handlePrevPeriod}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ddd6c8] bg-[#fffdfa] text-[#7b7467] transition-colors hover:bg-[#f6f1e8] hover:text-[#304034]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPeriod}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ddd6c8] bg-[#fffdfa] text-[#7b7467] transition-colors hover:bg-[#f6f1e8] hover:text-[#304034]"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="h-8 rounded-lg border border-[#ddd6c8] bg-[#fffdfa] px-3 text-sm text-[#304034] transition-colors hover:bg-[#f6f1e8]"
                >
                  Today
                </button>
              </div>
            </div>

            <TaskPlannerCalendar
              tasks={visibleTasks}
              year={calendar.year}
              month={calendar.month}
              today={calendar.today}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-[#e7dfd2] bg-[#fffdfa] px-4 py-2.5">
              <p className="text-sm text-[#7b7467]">
                <span className="font-semibold text-[#304034]">
                  {visibleTasks.length}
                </span>{" "}
                {visibleTasks.length === 1 ? "task" : "tasks"} in the calendar.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#7b7467]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6f8d6e]" />
                  Monthly tasks only
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="animate-drop-in animate-delay-150 rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
        <CardContent className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4dccd] bg-[#fffdfa] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6c6559]">
                <ListTodo className="h-3.5 w-3.5" />
                Task list
              </div>
              <h2 className="font-heading text-[1.55rem] font-semibold text-[#2f3e32]">
                Task List
              </h2>
              <p className="text-sm text-[#7b7467]">
                Daily, weekly, and monthly tasks all stay here together.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {LIST_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setListFilter(item)}
                  className={[
                    "rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                    listFilter === item
                      ? "border-[#90a77f] bg-[#eef4eb] text-[#304034]"
                      : "border-[#ddd6c8] bg-[#fffdfa] text-[#7b7467] hover:bg-[#f6f1e8] hover:text-[#304034]",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#fffdfa] px-4 py-3 text-sm text-[#7b7467]">
              Loading tasks...
            </div>
          )}
          {isError && (
            <div className="rounded-[1rem] border border-[#f2c6ca] bg-[#fff4f5] px-4 py-3 text-sm text-[#b34358]">
              Could not load tasks.
            </div>
          )}
          {!isLoading && taskListItems.length === 0 && (
            <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#fffdfa] px-4 py-4 text-sm text-[#7b7467]">
              {getListEmptyStateCopy(listFilter)}
            </div>
          )}

          <div className="space-y-3">
            {taskListItems.map((task) => {
              const isToggleAllowed = task.completed ? true : canCompleteTask(task);
              const itemId = `${task.taskId}:${task.occurrenceKey}`;

              return (
                <TaskPlannerItem
                  key={task.id}
                  task={task}
                  isCompleted={task.completed}
                  isToggleAllowed={isToggleAllowed}
                  isEditing={editingTaskId === itemId}
                  isSaving={isUpdating}
                  isDeleting={isDeleting}
                  onToggleComplete={() => {
                    if (!isToggleAllowed) return;
                    handleToggleComplete(task, !task.completed);
                  }}
                  onEdit={() => setEditingTaskId(itemId)}
                  onCancelEdit={() => setEditingTaskId(null)}
                  onSave={(values) => handleUpdate(task.taskId, values)}
                  onDelete={() => handleDelete(task.taskId)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendar;
