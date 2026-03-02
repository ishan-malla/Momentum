import { useEffect, useState } from "react";
import {
  readPomodoroTaskQueue,
  savePomodoroTaskQueue,
  type PomodoroTask,
  type PomodoroTaskQueueState,
} from "@/components/timer/pomodoroTaskQueueStorage";

const createTaskId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createTask = (title: string): PomodoroTask => ({
  id: createTaskId(),
  title,
  createdAt: new Date().toISOString(),
});

export const usePomodoroTaskQueue = () => {
  const [queue, setQueue] = useState<PomodoroTaskQueueState>(() => {
    return readPomodoroTaskQueue();
  });

  useEffect(() => {
    savePomodoroTaskQueue(queue);
  }, [queue]);

  const addTask = (rawTitle: string) => {
    const title = rawTitle.trim();
    if (!title) return null;

    const newTask = createTask(title);

    setQueue((previous) => ({
      ...previous,
      active: [newTask, ...previous.active],
    }));
    return newTask.id;
  };

  const archiveTask = (taskId: string) => {
    setQueue((previous) => {
      const fromActive = previous.active.find((task) => task.id === taskId);
      if (fromActive) {
        return {
          active: previous.active.filter((task) => task.id !== taskId),
          archived: [fromActive, ...previous.archived],
        };
      }

      return previous;
    });
  };

  const toggleTaskCompleted = (taskId: string) => {
    setQueue((previous) => {
      const activeTask = previous.active.find((task) => task.id === taskId);
      if (!activeTask) return previous;

      return {
        ...previous,
        active: previous.active.map((task) => {
          if (task.id !== taskId) return task;
          if (task.completedAt) {
            return { ...task, completedAt: undefined };
          }
          return { ...task, completedAt: new Date().toISOString() };
        }),
      };
    });
  };

  const clearArchived = () => {
    setQueue((previous) => ({
      ...previous,
      archived: [],
    }));
  };

  const archiveCompletedTasks = () => {
    setQueue((previous) => {
      const completedTasks = previous.active.filter((task) => Boolean(task.completedAt));
      if (completedTasks.length === 0) return previous;

      return {
        active: previous.active.filter((task) => !task.completedAt),
        archived: [...completedTasks, ...previous.archived],
      };
    });
  };

  return {
    activeTasks: queue.active,
    archivedTasks: queue.archived,
    addTask,
    toggleTaskCompleted,
    archiveTask,
    archiveCompletedTasks,
    clearArchived,
  };
};
