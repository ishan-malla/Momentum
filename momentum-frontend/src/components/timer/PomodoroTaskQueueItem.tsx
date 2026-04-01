import { Check } from "lucide-react";
import type { PomodoroTask } from "@/components/timer/pomodoroTaskQueueStorage";

export type PomodoroTaskView = PomodoroTask & {
  isArchived: boolean;
  isCompleted: boolean;
};

type Props = {
  task: PomodoroTaskView;
  animation?: "enter" | "exit";
  onToggle: (taskId: string) => void;
};

const getRowClassName = (task: PomodoroTaskView) => {
  if (task.isArchived) {
    return "border-border bg-muted/30";
  }

  if (task.isCompleted) {
    return "border-border bg-muted/55";
  }

  return "border-border hover:bg-muted/20";
};

const getCheckboxClassName = (task: PomodoroTaskView) => {
  if (task.isArchived) {
    return "bg-primary/70 text-primary-foreground opacity-70";
  }

  if (task.isCompleted) {
    return "bg-primary/70 text-primary-foreground";
  }

  return "border-2 border-input bg-transparent text-transparent hover:border-primary";
};

const getStatusTagClassName = (task: PomodoroTaskView) => {
  if (task.isArchived || task.isCompleted) {
    return "border-border bg-muted text-muted-foreground/80";
  }

  return "border-primary/20 bg-primary/5 text-primary/75";
};

const getStatusLabel = (task: PomodoroTaskView) => {
  if (task.isArchived) return "Archived";
  if (task.isCompleted) return "Completed";
  return "Active";
};

const getToggleAriaLabel = (task: PomodoroTaskView) => {
  if (task.isArchived) return `"${task.title}" is archived`;
  if (task.isCompleted) return `Mark "${task.title}" as active`;
  return `Mark "${task.title}" as completed`;
};

const getAnimationClassName = (animation?: "enter" | "exit") => {
  if (animation === "enter") return "animate-queue-enter";
  if (animation === "exit") return "animate-queue-exit pointer-events-none";
  return "";
};

export default function PomodoroTaskQueueItem({ task, animation, onToggle }: Props) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
        getRowClassName(task),
        getAnimationClassName(animation),
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={getToggleAriaLabel(task)}
        disabled={task.isArchived}
        className={[
          "flex h-6 w-6 shrink-0 self-center items-center justify-center rounded transition-colors disabled:cursor-not-allowed",
          getCheckboxClassName(task),
        ].join(" ")}
      >
        <Check className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-[15px] font-secondary font-medium",
            task.isArchived || task.isCompleted
              ? "text-muted-foreground/80 line-through"
              : "text-foreground",
          ].join(" ")}
        >
          {task.title}
        </p>
      </div>

      <span
        className={[
          "inline-flex h-7 items-center rounded-md border px-2 text-[11px] font-secondary",
          getStatusTagClassName(task),
        ].join(" ")}
      >
        {getStatusLabel(task)}
      </span>
    </div>
  );
}
