import { useMemo } from "react";
import type { TaskOccurrence } from "@/features/tasks/taskTypes";
import { cn } from "@/lib/utils";
import {
  formatTaskTimeLabel,
  getTaskTone,
} from "@/components/tasks/taskPlannerStyles";
import {
  formatTaskDateValue,
  getTaskWeekStart,
} from "@/features/tasks/taskRecurrence";

type Props = {
  tasks: TaskOccurrence[];
  focusDate: Date;
  today?: Date;
};

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TaskPlannerWeekView({
  tasks,
  focusDate,
  today = new Date(),
}: Props) {
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const days = useMemo(() => {
    const start = getTaskWeekStart(focusDate);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      return {
        date,
        key: formatTaskDateValue(date),
        label: DAY_LABELS[index],
        isToday: normalizedDate.getTime() === normalizedToday.getTime(),
      };
    });
  }, [focusDate, normalizedToday]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskOccurrence[]>();

    tasks.forEach((task) => {
      const existing = map.get(task.scheduledDate) ?? [];
      existing.push(task);
      map.set(
        task.scheduledDate,
        existing.sort((left, right) => left.scheduledTime.localeCompare(right.scheduledTime)),
      );
    });

    return map;
  }, [tasks]);

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const dayTasks = tasksByDate.get(day.key) ?? [];

        return (
          <div
            key={day.key}
            className={cn(
              "min-h-[168px] rounded-[1.05rem] border p-3 shadow-[0_8px_24px_rgba(57,52,43,0.05)]",
              day.isToday
                ? "border-[#d9e5d4] bg-[#f4f8f1]"
                : "border-[#e7dfd2] bg-[#fffdfa]",
            )}
          >
            <div className="space-y-1 border-b border-[#ece5d8] pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a826f]">
                {day.label}
              </p>
              <p className="font-heading text-lg font-semibold text-[#2f3e32]">
                {day.date.getDate()}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {dayTasks.length === 0 ? (
                <p className="text-xs text-[#a09789]">No weekly tasks</p>
              ) : (
                dayTasks.map((task) => {
                  const tone = getTaskTone(task);

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "rounded-xl border px-2.5 py-2 text-left shadow-[0_4px_12px_rgba(57,52,43,0.05)]",
                        task.completed
                          ? tone.mutedEventClassName
                          : tone.eventClassName,
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          task.completed && "line-through",
                        )}
                      >
                        {task.name}
                      </p>
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] opacity-80">
                        {formatTaskTimeLabel(task.scheduledTime)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
