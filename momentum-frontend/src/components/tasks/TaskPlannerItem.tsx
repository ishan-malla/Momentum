import * as React from "react";
import { Check, MoreVertical } from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";
import type { TaskOccurrence, TaskPayload } from "@/features/tasks/taskTypes";
import { cn } from "@/lib/utils";
import {
  formatTaskTimeLabel,
  getPriorityBadgeClassName,
  getTaskTone,
} from "@/components/tasks/taskPlannerStyles";

type Props = {
  task: TaskOccurrence;
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

const formatSchedule = (task: TaskOccurrence) => {
  if (!task.scheduledDate && !task.scheduledTime) return "No schedule";
  if (task.scheduledDate && task.scheduledTime) {
    return `${task.scheduledDate} • ${formatTaskTimeLabel(task.scheduledTime)}`;
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const tone = getTaskTone(task);

  React.useEffect(() => {
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
          name: task.baseTask.name,
          description: task.baseTask.description ?? "",
          priority: task.baseTask.priority,
          frequency: task.baseTask.frequency,
          reminder: task.baseTask.reminder,
          reminderOffsetDays: task.baseTask.reminderOffsetDays ?? 0,
          scheduledDate: task.baseTask.scheduledDate,
          scheduledTime: task.baseTask.scheduledTime,
        }}
        submitLabel="Update task"
        onSubmit={onSave}
        onCancel={onCancelEdit}
        isSubmitting={isSaving}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-start gap-3 rounded-[1.15rem] border px-4 py-4 shadow-[0_10px_30px_rgba(57,52,43,0.06)]",
        isMenuOpen && "z-30",
        tone.surfaceClassName,
      )}
    >
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

      <div className="min-w-0 flex-1 pl-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={[
              "min-w-0 truncate pr-2 text-sm font-heading font-semibold",
              isCompleted ? "text-[#8f877a] line-through" : "text-[#304034]",
            ].join(" ")}
          >
            {task.name}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              getPriorityBadgeClassName(task.priority),
            )}
          >
            {task.priority}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#7b7467]">{formatSchedule(task)}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a826f]">
          {task.frequency}
        </p>
        {task.description ? (
          <p className="mt-2 text-xs leading-5 text-[#60594f]">{task.description}</p>
        ) : null}
      </div>

      <div className="relative flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#7b7467] transition-colors hover:bg-[#f6f1e8] hover:text-[#304034]"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label="Task actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-1 w-28 overflow-hidden rounded-md border border-[#e7dfd2] bg-[#fffdfa] p-1 text-sm shadow-[0_12px_24px_rgba(57,52,43,0.12)] animate-drop-in"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-[#304034] transition-colors hover:bg-[#f6f1e8]"
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
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-destructive transition-colors hover:bg-[#fff1ea] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
