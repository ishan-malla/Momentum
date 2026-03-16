import { useMemo } from "react";
import { useCalendar } from "@/hooks/useCalendarHook";
import type { Task } from "@/features/tasks/taskTypes";
import { parseTaskDateParts } from "@/features/tasks/taskDateUtils";

type Props = {
  tasks: Task[];
  year?: number;
  month?: number;
  today?: Date;
};

const WEEK_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function TaskPlannerCalendar({
  tasks,
  year,
  month,
  today,
}: Props) {
  const calendar = useCalendar({ year, month, today });

  const tasksByDay = useMemo(() => {
    const map = new Map<number, Task[]>();

    tasks.forEach((task) => {
      const parts = parseTaskDateParts(task.scheduledDate);
      if (!parts) return;
      if (parts.year !== calendar.year || parts.month !== calendar.month)
        return;
      if (parts.day < 1 || parts.day > calendar.totalDays) return;

      const existing = map.get(parts.day) ?? [];
      existing.push(task);
      map.set(parts.day, existing);
    });

    return map;
  }, [tasks, calendar.year, calendar.month, calendar.totalDays]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
        {WEEK_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {calendar.weeks.map((week, weekIndex) =>
          week.days.map((day, dayIndex) => {
            if (!day) {
              return (
                <div
                  key={`empty-${weekIndex}-${dayIndex}`}
                  className="min-h-[92px] rounded-md"
                />
              );
            }

            const dayTasks = tasksByDay.get(day.dayNumber) ?? [];
            const visibleTasks = dayTasks.slice(0, 2);
            const overflowCount = dayTasks.length - visibleTasks.length;

            return (
              <div
                key={`day-${day.dayNumber}`}
                className={`min-h-[92px] rounded-md border px-2 py-2 text-left text-xs sm:min-h-[110px] ${
                  day.isToday ? "border-warning" : "border-border"
                }`}
              >
                <div
                  className={`text-[10px] font-semibold ${
                    day.isToday ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {day.dayNumber}
                </div>

                <div className="mt-2 space-y-1">
                  {visibleTasks.map((task) => {
                    const isCompleted = task.completed;
                    return (
                      <div
                        key={task.id}
                        className={[
                          "truncate rounded  px-1.5 py-0.5 text-xs bg-red-200 font-extrabold ",
                          isCompleted
                            ? "text-muted-foreground line-through"
                            : "text-foreground/80",
                        ].join(" ")}
                        title={task.name}
                      >
                        {task.name}
                      </div>
                    );
                  })}
                  {overflowCount > 0 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{overflowCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
