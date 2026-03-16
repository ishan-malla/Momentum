import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Task, TaskPayload } from "@/features/tasks/taskTypes";
import TaskForm from "@/components/tasks/TaskForm";

type Props = {
  task: Task;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
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

export default function TaskCard({
  task,
  isEditing,
  isSaving,
  isDeleting,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: Props) {
  if (isEditing) {
    return (
      <TaskForm
        title="Edit task"
        initialValues={{
          name: task.name,
          description: task.description ?? "",
          priority: task.priority,
          frequency: task.frequency,
          completed: task.completed,
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
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-heading font-semibold text-foreground">
            {task.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{formatSchedule(task)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {task.description ? (
        <p className="mt-3 text-sm text-muted-foreground">{task.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-1">
          {task.priority}
        </span>
        <span className="rounded-full border border-border px-2 py-1">
          {task.frequency}
        </span>
        <span className="rounded-full border border-border px-2 py-1">
          {task.reminder ? "reminder on" : "reminder off"}
        </span>
      </div>
    </Card>
  );
}
