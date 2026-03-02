export type PomodoroTask = {
  id: string;
  title: string;
  createdAt: string;
  completedAt?: string;
};

export type PomodoroTaskQueueState = {
  active: PomodoroTask[];
  archived: PomodoroTask[];
};

const STORAGE_KEY = "pomodoro_task_queue_v1";

const EMPTY_QUEUE: PomodoroTaskQueueState = {
  active: [],
  archived: [],
};

const sanitizeTask = (value: unknown): PomodoroTask | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || typeof candidate.title !== "string") {
    return null;
  }

  const createdAt =
    typeof candidate.createdAt === "string"
      ? candidate.createdAt
      : new Date().toISOString();

  const completedAt =
    typeof candidate.completedAt === "string" ? candidate.completedAt : undefined;

  return {
    id: candidate.id,
    title: candidate.title,
    createdAt,
    completedAt,
  };
};

const sanitizeTaskList = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.map(sanitizeTask).filter((task): task is PomodoroTask => Boolean(task));
};

export const readPomodoroTaskQueue = (): PomodoroTaskQueueState => {
  if (typeof window === "undefined") return EMPTY_QUEUE;

  const rawQueue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawQueue) return EMPTY_QUEUE;

  try {
    const parsed = JSON.parse(rawQueue) as Record<string, unknown>;
    const active = sanitizeTaskList(parsed.active);
    const completed = sanitizeTaskList(parsed.completed);
    const archived = sanitizeTaskList(parsed.archived);
    const mergedArchived = [...archived, ...completed];

    return {
      active,
      archived: mergedArchived,
    };
  } catch {
    return EMPTY_QUEUE;
  }
};

export const savePomodoroTaskQueue = (queue: PomodoroTaskQueueState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};
