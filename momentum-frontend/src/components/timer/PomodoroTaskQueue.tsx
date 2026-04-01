import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PomodoroTaskComposer from "@/components/timer/PomodoroTaskComposer";
import PomodoroTaskQueueItem, {
  type PomodoroTaskView,
} from "@/components/timer/PomodoroTaskQueueItem";
import { usePomodoroTaskQueue } from "@/components/timer/usePomodoroTaskQueue";
const MAX_TASK_TITLE_LENGTH = 80;
const BATCH_ANIMATION_MS = 240;
const CREATE_ANIMATION_MS = 280;

const createVisibleTasks = (
  activeTasks: ReturnType<typeof usePomodoroTaskQueue>["activeTasks"],
  archivedTasks: ReturnType<typeof usePomodoroTaskQueue>["archivedTasks"],
  showArchived: boolean,
): PomodoroTaskView[] => {
  if (showArchived) {
    return archivedTasks.map((task) => ({
      ...task,
      isArchived: true,
      isCompleted: true,
    }));
  }
  return activeTasks.map((task) => ({
    ...task,
    isArchived: false,
    isCompleted: Boolean(task.completedAt),
  }));
};

export default function PomodoroTaskQueue() {
  const [taskTitle, setTaskTitle] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [enteringTaskId, setEnteringTaskId] = useState<string | null>(null);
  const [exitingTaskIds, setExitingTaskIds] = useState<string[]>([]);
  const {
    activeTasks,
    archivedTasks,
    addTask,
    toggleTaskCompleted,
    archiveCompletedTasks,
    clearArchived,
  } = usePomodoroTaskQueue();
  const activeCompletedCount = activeTasks.filter(
    (task) => task.completedAt,
  ).length;
  const visibleTasks = useMemo(
    () => createVisibleTasks(activeTasks, archivedTasks, showArchived),
    [activeTasks, archivedTasks, showArchived],
  );
  const isExitAnimating = exitingTaskIds.length > 0;

  const handleSubmitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const createdTaskId = addTask(taskTitle);
    if (!createdTaskId) return;
    setShowArchived(false);
    setTaskTitle("");
    setIsComposerOpen(false);
    setEnteringTaskId(createdTaskId);
    window.setTimeout(() => {
      setEnteringTaskId((previous) =>
        previous === createdTaskId ? null : previous,
      );
    }, CREATE_ANIMATION_MS);
  };

  const handleToggleTask = (taskId: string) => {
    if (isExitAnimating || exitingTaskIds.includes(taskId)) return;
    const task = visibleTasks.find((item) => item.id === taskId);
    if (!task || task.isArchived) return;
    toggleTaskCompleted(taskId);
  };

  const handleArchiveCompleted = () => {
    if (isExitAnimating) return;
    const completedTaskIds = activeTasks
      .filter((task) => Boolean(task.completedAt))
      .map((task) => task.id);
    if (completedTaskIds.length === 0) {
      archiveCompletedTasks();
      return;
    }
    setExitingTaskIds(completedTaskIds);
    window.setTimeout(() => {
      archiveCompletedTasks();
      setExitingTaskIds([]);
    }, BATCH_ANIMATION_MS);
  };

  const handleClearArchived = () => {
    if (isExitAnimating) return;
    const archivedTaskIds = archivedTasks.map((task) => task.id);
    if (archivedTaskIds.length === 0) {
      clearArchived();
      return;
    }
    setExitingTaskIds(archivedTaskIds);
    window.setTimeout(() => {
      clearArchived();
      setExitingTaskIds([]);
    }, BATCH_ANIMATION_MS);
  };

  return (
    <Card className="w-full rounded-2xl border border-border/80 bg-card p-4 shadow-none sm:p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-heading font-semibold text-foreground">
              Task Queue
            </h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isExitAnimating) return;
              setEnteringTaskId(null);
              setShowArchived((previous) => !previous);
            }}
            disabled={isExitAnimating}
            className="h-8 px-2 text-xs font-secondary text-muted-foreground/75 hover:text-foreground"
          >
            {showArchived ? "View Active" : "View Archived"}
          </Button>
        </div>
        <div className="space-y-2">
          {visibleTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm font-franklin text-muted-foreground">
              {showArchived ? "No archived tasks yet." : "No tasks yet."}
            </div>
          ) : (
            visibleTasks.map((task) => (
              <PomodoroTaskQueueItem
                key={task.id}
                task={task}
                animation={
                  exitingTaskIds.includes(task.id)
                    ? "exit"
                    : enteringTaskId === task.id
                      ? "enter"
                      : undefined
                }
                onToggle={handleToggleTask}
              />
            ))
          )}
        </div>
        {!showArchived && activeCompletedCount > 0 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleArchiveCompleted}
              disabled={isExitAnimating}
              className="h-8 px-2 text-xs font-secondary text-muted-foreground/70 hover:text-muted-foreground"
            >
              Clear completed ({activeCompletedCount})
            </Button>
          </div>
        )}
        {showArchived && archivedTasks.length > 0 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearArchived}
              disabled={isExitAnimating}
              className="h-8 px-2 text-xs font-secondary text-muted-foreground hover:text-destructive"
            >
              Clear archived ({archivedTasks.length})
            </Button>
          </div>
        )}
        <PomodoroTaskComposer
          isOpen={isComposerOpen}
          taskTitle={taskTitle}
          maxTaskTitleLength={MAX_TASK_TITLE_LENGTH}
          onOpen={() => {
            if (isExitAnimating) return;
            setIsComposerOpen(true);
          }}
          onTaskTitleChange={setTaskTitle}
          onSubmit={handleSubmitTask}
          onCancel={() => {
            setIsComposerOpen(false);
            setTaskTitle("");
          }}
        />
      </div>
    </Card>
  );
}
