import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TaskForm from "@/components/tasks/TaskForm";
import TaskPlannerItem from "@/components/tasks/TaskPlannerItem";
import TaskPlannerCalendar from "@/components/tasks/TaskPlannerCalendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "@/features/tasks/taskApiSlice";
import type { Task, TaskFrequency, TaskPayload } from "@/features/tasks/taskTypes";
import { useCalendar } from "@/hooks/useCalendarHook";
import { parseTaskDateParts } from "@/features/tasks/taskDateUtils";
import { canCompleteTask } from "@/features/tasks/taskCompletionUtils";

type FrequencyFilter = "all" | TaskFrequency;

const FILTERS: FrequencyFilter[] = ["all", "daily", "weekly", "monthly"];

const sortTasks = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
    if (dateCompare !== 0) return dateCompare;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });
};

const TaskCalendar = () => {
  const [filter, setFilter] = useState<FrequencyFilter>("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());

  const { data: tasks = [], isLoading, isError } = useGetTasksQuery(
    filter === "all" ? undefined : { frequency: filter },
  );
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const visibleTasks = useMemo(() => {
    const list = filter === "all" ? tasks : tasks.filter((t) => t.frequency === filter);
    return sortTasks(list);
  }, [tasks, filter]);

  const calendar = useCalendar({ year: calendarYear, month: calendarMonth });

  const monthTaskCount = useMemo(() => {
    return visibleTasks.reduce((total, task) => {
      const parts = parseTaskDateParts(task.scheduledDate);
      if (!parts) return total;
      if (parts.year !== calendar.year || parts.month !== calendar.month) return total;
      return total + 1;
    }, 0);
  }, [visibleTasks, calendar.year, calendar.month]);

  const handlePrevMonth = () => {
    const next = new Date(calendar.year, calendar.month - 1, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth());
  };

  const handleNextMonth = () => {
    const next = new Date(calendar.year, calendar.month + 1, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth());
  };

  const handleToday = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
  };

  const toggleTaskComplete = (id: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };


  const handleCreate = async (values: TaskPayload) => {
    try {
      await createTask(values).unwrap();
      toast.success("Task created");
      setShowCreateForm(false);
    } catch {
      toast.error("Task creation failed");
    }
  };

  const handleUpdate = async (id: string, values: TaskPayload) => {
    try {
      await updateTask({ id, patch: values }).unwrap();
      setEditingTaskId(null);
      toast.success("Task updated");
    } catch {
      toast.error("Task update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted");
    } catch {
      toast.error("Task delete failed");
    }
  };

  return (
    <div className="mx-auto mt-6 w-full space-y-6 px-4 sm:px-5 xl:max-w-6xl xl:px-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-semibold text-foreground sm:text-3xl">
            Tasks & Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize tasks by priority and schedule daily, weekly, or monthly.
          </p>
        </div>

        <Button
          type="button"
          variant={showCreateForm ? "outline" : "default"}
          onClick={() => setShowCreateForm((prev) => !prev)}
        >
          {showCreateForm ? "Close" : "Task"}
        </Button>
      </div>

      {showCreateForm && (
        <TaskForm
          title="Create task"
          submitLabel="Add task"
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={isCreating}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={[
              "rounded-full border px-3 py-1 text-xs font-secondary uppercase tracking-wide transition-colors",
              filter === item
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-heading font-semibold text-foreground sm:text-xl">
            Task Planner
          </h2>
          <p className="text-xs text-muted-foreground">
            {visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
        {isError && (
          <p className="text-sm text-destructive">Could not load tasks.</p>
        )}
        {!isLoading && visibleTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        )}

        {visibleTasks.map((task) => {
          const isToggleAllowed = canCompleteTask(task);
          return (
            <TaskPlannerItem
              key={task.id}
              task={task}
              isCompleted={completedTaskIds.has(task.id)}
              isToggleAllowed={isToggleAllowed}
              isEditing={editingTaskId === task.id}
              isSaving={isUpdating}
              isDeleting={isDeleting}
              onToggleComplete={() => {
                if (isToggleAllowed) {
                  toggleTaskComplete(task.id);
                }
              }}
              onEdit={() => setEditingTaskId(task.id)}
              onCancelEdit={() => setEditingTaskId(null)}
              onSave={(values) => handleUpdate(task.id, values)}
              onDelete={() => handleDelete(task.id)}
            />
          );
        })}
      </div>

      <Card className="py-3">
        <CardContent className="space-y-4 px-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-heading font-semibold text-foreground sm:text-lg">
                Calendar
              </h2>
              <p className="text-xs text-muted-foreground">
                {calendar.monthName} {calendar.year} • {monthTaskCount}{" "}
                {monthTaskCount === 1 ? "task" : "tasks"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-7 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
                aria-label="Previous month"
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-7 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
                aria-label="Next month"
              >
                →
              </button>
              {!calendar.isCurrentMonth && (
                <button
                  type="button"
                  onClick={handleToday}
                  className="h-7 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-accent"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          <TaskPlannerCalendar
            tasks={visibleTasks}
            completedTaskIds={completedTaskIds}
            year={calendar.year}
            month={calendar.month}
            today={calendar.today}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendar;
