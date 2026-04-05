import type { TaskOccurrence } from "@/features/tasks/taskTypes";
import { cn } from "@/lib/utils";
import {
  formatTaskTimeLabel,
  getPriorityBadgeClassName,
  getTaskTone,
} from "@/components/tasks/taskPlannerStyles";

type Props = {
  tasks: TaskOccurrence[];
  date: Date;
  today?: Date;
};

export default function TaskPlannerDayView({
  tasks,
  date,
  today = new Date(),
}: Props) {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const isToday = normalizedDate.getTime() === normalizedToday.getTime();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.2rem] border shadow-[0_10px_30px_rgba(57,52,43,0.06)]",
        isToday ? "border-[#d9e5d4] bg-[#f4f8f1]" : "border-[#e7dfd2] bg-[#fffdfa]",
      )}
    >
      <div className="border-b border-[#ece5d8] bg-[#faf6ef] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a826f]">
          {date.toLocaleDateString(undefined, { weekday: "long" })}
        </p>
        <p className="font-heading text-[1.45rem] font-semibold text-[#2f3e32]">
          {date.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-3 px-4 py-4">
        {tasks.length === 0 ? (
          <p className="text-sm text-[#7b7467]">No daily tasks scheduled for this day.</p>
        ) : (
          tasks.map((task) => {
            const tone = getTaskTone(task);

            return (
              <div
                key={task.id}
                className={cn(
                  "rounded-[1rem] border px-4 py-3",
                  tone.surfaceClassName,
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-heading font-semibold text-[#304034]",
                        task.completed && "text-[#8f877a] line-through",
                      )}
                    >
                      {task.name}
                    </p>
                    <p className="mt-1 text-xs text-[#7b7467]">
                      {formatTaskTimeLabel(task.scheduledTime)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      getPriorityBadgeClassName(task.priority),
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
