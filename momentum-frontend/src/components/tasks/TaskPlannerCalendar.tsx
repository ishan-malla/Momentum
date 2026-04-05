import { useMemo } from "react";
import { useCalendar } from "@/hooks/useCalendarHook";
import type { TaskOccurrence } from "@/features/tasks/taskTypes";
import { cn } from "@/lib/utils";
import {
  formatTaskTimeLabel,
  getTaskTone,
} from "@/components/tasks/taskPlannerStyles";

type Props = {
  tasks: TaskOccurrence[];
  year?: number;
  month?: number;
  today?: Date;
};

const WEEK_LABELS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function TaskPlannerCalendar({
  tasks,
  year,
  month,
  today,
}: Props) {
  const calendar = useCalendar({ year, month, today });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskOccurrence[]>();

    tasks.forEach((task) => {
      const existing = map.get(task.scheduledDate) ?? [];
      existing.push(task);
      map.set(task.scheduledDate, existing.sort((left, right) => left.scheduledTime.localeCompare(right.scheduledTime)));
    });

    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calendar.year, calendar.month, 1);
    const offsetFromMonday = (firstDayOfMonth.getDay() + 6) % 7;
    const startDate = new Date(calendar.year, calendar.month, 1 - offsetFromMonday);
    const normalizedToday = new Date(
      calendar.today.getFullYear(),
      calendar.today.getMonth(),
      calendar.today.getDate(),
    );

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + index);

      const normalizedDate = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate(),
      );

      return {
        date: cellDate,
        key: toIsoDate(cellDate),
        dayNumber: cellDate.getDate(),
        isCurrentMonth:
          cellDate.getFullYear() === calendar.year &&
          cellDate.getMonth() === calendar.month,
        isToday: normalizedDate.getTime() === normalizedToday.getTime(),
      };
    });
  }, [calendar.month, calendar.today, calendar.year]);

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-[#e7dfd2] bg-[#fffdfa] shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <div className="grid grid-cols-7 border-b border-[#ece5d8] bg-[#faf6ef]">
        {WEEK_LABELS.map((label) => (
          <div
            key={label}
            className="px-1 py-2.5 text-center text-[9px] font-semibold tracking-[0.16em] text-[#8a826f] sm:text-[10px]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayTasks = tasksByDate.get(day.key) ?? [];
          const visibleTasks = dayTasks.slice(0, 2);
          const overflowCount = dayTasks.length - visibleTasks.length;
          const isLastColumn = index % 7 === 6;
          const isLastRow = Math.floor(index / 7) === 5;

          return (
            <div
              key={day.key}
              className={cn(
                "min-h-[82px] px-1.5 py-1.5 text-left sm:min-h-[96px] sm:px-2.5 sm:py-2",
                !isLastColumn && "border-r border-[#ece5d8]",
                !isLastRow && "border-b border-[#ece5d8]",
                day.isCurrentMonth
                  ? "bg-[#fffdfa]"
                  : "bg-[repeating-linear-gradient(135deg,rgba(246,241,232,0.95)_0px,rgba(246,241,232,0.95)_2px,transparent_2px,transparent_10px)]",
                day.isToday && "bg-[#f4f8f1]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[13px] font-semibold sm:h-8 sm:min-w-8 sm:px-2 sm:text-sm",
                    day.isToday
                      ? "bg-[#6f8d6e] text-white shadow-[0_8px_18px_rgba(57,52,43,0.12)]"
                      : day.isCurrentMonth
                        ? "text-[#304034]"
                        : "text-[#b4ab9d]",
                  )}
                >
                  {day.dayNumber}
                </div>
              </div>

              <div className="mt-1.5 space-y-1">
                {visibleTasks.map((task) => {
                  const tone = getTaskTone(task);

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-1.5 overflow-hidden rounded-md border px-1.5 py-0.5 text-[9px] font-semibold shadow-[0_4px_12px_rgba(57,52,43,0.05)] sm:px-2 sm:py-1 sm:text-[10px]",
                        task.completed
                          ? tone.mutedEventClassName
                          : tone.eventClassName,
                      )}
                      title={`${task.name}${task.scheduledTime ? ` • ${formatTaskTimeLabel(task.scheduledTime)}` : ""}`}
                    >
                      <span
                        className={cn(
                          "truncate",
                          task.completed && "line-through",
                        )}
                      >
                        {task.name}
                      </span>
                      {task.scheduledTime ? (
                        <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-[0.08em] opacity-80 sm:text-[10px]">
                          {formatTaskTimeLabel(task.scheduledTime)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
                {overflowCount > 0 && (
                  <div className="pl-1 text-[9px] font-medium text-[#8a826f] sm:text-[10px]">
                    +{overflowCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
