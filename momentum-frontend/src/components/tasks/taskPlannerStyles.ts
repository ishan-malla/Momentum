import type { Task, TaskPriority } from "@/features/tasks/taskTypes";

type TaskTone = {
  eventClassName: string;
  mutedEventClassName: string;
  surfaceClassName: string;
  accentClassName: string;
};

const TASK_TONES: TaskTone[] = [
  {
    eventClassName: "border-[#d4dfcf] bg-[#eef4eb] text-[#304034]",
    mutedEventClassName: "border-[#e2e6de] bg-[#f7f9f5] text-[#8a887f]",
    surfaceClassName: "border-[#d9e2d4] bg-[#fffdfa]",
    accentClassName: "bg-[#6f8d6e]",
  },
  {
    eventClassName: "border-[#e6dcc9] bg-[#faf4e9] text-[#6a5b48]",
    mutedEventClassName: "border-[#ebe5db] bg-[#fdfaf4] text-[#969080]",
    surfaceClassName: "border-[#e7ddca] bg-[#fffdfa]",
    accentClassName: "bg-[#c9ab76]",
  },
  {
    eventClassName: "border-[#d6dfcf] bg-[#f0f5ec] text-[#435841]",
    mutedEventClassName: "border-[#e4e9df] bg-[#f8faf5] text-[#8a8e84]",
    surfaceClassName: "border-[#dbe4d4] bg-[#fffdfa]",
    accentClassName: "bg-[#90a77f]",
  },
  {
    eventClassName: "border-[#ead8cd] bg-[#fbf0ea] text-[#8a624d]",
    mutedEventClassName: "border-[#efe3da] bg-[#fdf7f4] text-[#9b8a81]",
    surfaceClassName: "border-[#e8d8cc] bg-[#fffdfa]",
    accentClassName: "bg-[#b9896d]",
  },
  {
    eventClassName: "border-[#ddd6c8] bg-[#f6f1e8] text-[#61584a]",
    mutedEventClassName: "border-[#e8e1d6] bg-[#fcfaf6] text-[#989184]",
    surfaceClassName: "border-[#ddd6c8] bg-[#fffdfa]",
    accentClassName: "bg-[#b8ab95]",
  },
];

const PRIORITY_BADGES: Record<TaskPriority, string> = {
  low: "border-[#d4dfcf] bg-[#eef4eb] text-[#304034]",
  medium: "border-[#e6dcc9] bg-[#faf4e9] text-[#6a5b48]",
  high: "border-[#ead8cd] bg-[#fbf0ea] text-[#8a624d]",
};

const hashValue = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export const getTaskTone = (
  task: Pick<Task, "id" | "name" | "scheduledDate" | "frequency">,
): TaskTone => {
  const seed = `${task.id}:${task.name}:${task.scheduledDate}:${task.frequency}`;
  return TASK_TONES[hashValue(seed) % TASK_TONES.length];
};

export const getPriorityBadgeClassName = (priority: TaskPriority) => {
  return PRIORITY_BADGES[priority];
};

export const formatTaskTimeLabel = (value?: string) => {
  if (!value) return "";

  const [hourText, minuteText = "00"] = value.split(":");
  const hour = Number(hourText);

  if (Number.isNaN(hour)) return value;

  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  const meridiem = hour >= 12 ? "PM" : "AM";

  return `${normalizedHour}:${minuteText} ${meridiem}`;
};
