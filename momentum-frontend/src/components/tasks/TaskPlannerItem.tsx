import { useEffect, useRef, useState } from "react";
import { Check, MoreVertical } from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";
import type { Task, TaskPayload } from "@/features/tasks/taskTypes";

type Props = {
  task: Task;
  isCompleted: boolean;
  isToggleAllowed: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (values: TaskPayload) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

const formatSchedule = (task: Task) => {
  if (!task.scheduledDate && !task.scheduledTime) return "No schedule";
  if (task.scheduledDate && task.scheduledTime) {
    return `${task.scheduledDate} • ${task.scheduledTime}`;
  }
  return task.scheduledDate || task.scheduledTime;
};

export default function TaskPlannerItem({
  task,
  isCompleted,
  isToggleAllowed,
  isEditing,
  isSaving,
  isDeleting,
  onToggleComplete,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handlePointer);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointer);
    };
  }, [isMenuOpen]);
  if (isEditing) {
    return (
      <TaskForm
        title="Edit task"
        initialValues={{
          name: task.name,
          description: task.description ?? "",
          priority: task.priority,
          frequency: task.frequency,
          reminder: task.reminder,
          reminderOffsetDays: task.reminderOffsetDays ?? 0,
          scheduledDate: task.scheduledDate,
          scheduledTime: task.scheduledTime,
        }}
        submitLabel="Update task"
        onSubmit={onSave}
        onCancel={onCancelEdit}
        isSubmitting={isSaving}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <button
        type="button"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors ${
          isCompleted
            ? "bg-primary/70 text-primary-foreground"
            : "border-2 border-input hover:border-primary"
        } ${!isToggleAllowed ? "cursor-not-allowed opacity-50 hover:border-input" : ""}`}
        onClick={onToggleComplete}
        disabled={!isToggleAllowed}
        title={
          isToggleAllowed
            ? "Mark task completed"
            : "You can complete this task during its scheduled period"
        }
      >
        {isCompleted && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={[
              "truncate text-sm font-heading font-semibold",
              isCompleted ? "text-muted-foreground line-through" : "text-foreground",
            ].join(" ")}
          >
            {task.name}
          </p>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {task.priority}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatSchedule(task)} • {task.frequency}
        </p>
        {task.description ? (
          <p className="mt-2 text-xs text-muted-foreground">{task.description}</p>
        ) : null}
      </div>

      <div className="relative flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label="Task actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 w-28 overflow-hidden rounded-md border border-border bg-popover p-1 text-sm shadow-md animate-drop-in"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-foreground transition-colors hover:bg-muted/60"
            >
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete();
              }}
              disabled={isDeleting}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
