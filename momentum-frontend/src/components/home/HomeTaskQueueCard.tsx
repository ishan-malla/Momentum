import { Link } from "react-router";
import { Check, ChevronRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTaskTimeLabel, getPriorityBadgeClassName } from "@/components/tasks/taskPlannerStyles";
import { canCompleteTask } from "@/features/tasks/taskCompletionUtils";
import { formatHomeTaskDayLabel, type HomeSummaryStat } from "@/features/home/homeOverview";
import type { TaskOccurrence } from "@/features/tasks/taskTypes";

type Props = {
  tasks: TaskOccurrence[];
  nextTask: TaskOccurrence | null;
  todayValue: string;
  now: Date;
  isLoading: boolean;
  isError: boolean;
  isUpdating: boolean;
  quickStats: HomeSummaryStat[];
  onRetry: () => void;
  onToggle: (task: TaskOccurrence, nextCompleted: boolean) => void;
};

const TaskQueueRow = ({
  task,
  now,
  isUpdating,
  onToggle,
}: {
  task: TaskOccurrence;
  now: Date;
  isUpdating: boolean;
  onToggle: (task: TaskOccurrence, nextCompleted: boolean) => void;
}) => {
  const isToggleAllowed = canCompleteTask(task, now);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
      <button
        type="button"
        onClick={() => onToggle(task, !task.completed)}
        disabled={isUpdating || !isToggleAllowed}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
          task.completed ? "bg-primary text-primary-foreground" : "border-2 border-border"
        } ${!isToggleAllowed ? "opacity-50" : ""}`}
      >
        {task.completed ? <Check className="h-3.5 w-3.5" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`truncate text-sm font-heading font-semibold ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {task.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTaskTimeLabel(task.scheduledTime)}
            </p>
          </div>

          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${getPriorityBadgeClassName(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

const HomeTaskQueueCard = ({
  tasks,
  nextTask,
  todayValue,
  now,
  isLoading,
  isError,
  isUpdating,
  quickStats,
  onRetry,
  onToggle,
}: Props) => {
  return (
    <Card className="gap-0 self-start rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Today&apos;s Queue
          </p>
          <h2 className="mt-1 font-heading text-xl text-[#2f3e32]">
            Keep the next move obvious
          </h2>
        </div>

        <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
                Next task
              </p>
              <p className="mt-2 text-base font-semibold text-[#2f3e32]">
                {isError ? "Couldn’t load" : nextTask?.name ?? "Nothing scheduled soon"}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#7b7467]">
                {isError
                  ? "Task scheduling is unavailable right now."
                  : nextTask
                    ? `${formatHomeTaskDayLabel(nextTask, todayValue, now)} at ${formatTaskTimeLabel(nextTask.scheduledTime)}`
                    : "The next few days are clear right now."}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="space-y-2 rounded-[1rem] border border-[#e7dfd2] bg-[#fffdfa] px-4 py-4">
          {quickStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center justify-between gap-3 ${index < quickStats.length - 1 ? "border-b border-[#eee6da] pb-2" : ""}`}
            >
              <span className="text-sm text-[#7b7467]">{stat.label}</span>
              <span className="text-sm font-semibold text-[#2f3e32]">{stat.value}</span>
            </div>
          ))}
        </div>

        {isError ? (
          <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] p-4">
            <p className="text-sm font-semibold text-[#2f3e32]">Couldn&apos;t load today&apos;s queue</p>
            <p className="mt-1 text-sm text-[#7b7467]">Refresh tasks to bring the queue back.</p>
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              className="mt-3 border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]"
            >
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[74px] rounded-lg" />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskQueueRow key={task.id} task={task} now={now} isUpdating={isUpdating} onToggle={onToggle} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] p-4">
            <p className="text-base font-semibold text-[#2f3e32]">Nothing scheduled for today</p>
            <p className="mt-1 text-sm leading-6 text-[#7b7467]">
              The queue is clear for now. Use the planner when you want to map out the rest of the week.
            </p>
          </div>
        )}

        <Button
          asChild
          variant="outline"
          className="h-10 w-full justify-between rounded-xl border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]"
        >
          <Link to="/task-calendar">
            View full planner
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default HomeTaskQueueCard;
