import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  TaskAnalyticsHighlights,
  TaskAnalyticsSummary,
} from "@/features/tasks/taskAnalytics";

type Props = {
  summary: TaskAnalyticsSummary;
  highlights: TaskAnalyticsHighlights;
};

type DetailRowProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

const DetailRow = ({ label, value, emphasize = false }: DetailRowProps) => (
  <div className="flex items-start justify-between gap-3 border-b border-[#eee6da] py-2.5 last:border-b-0 last:pb-0">
    <span className="text-[11px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
      {label}
    </span>
    <span
      className={[
        "max-w-[58%] text-right text-[13px] leading-5",
        emphasize ? "font-semibold text-[#304034]" : "font-medium text-[#5f584d]",
      ].join(" ")}
    >
      {value}
    </span>
  </div>
);

export default function TaskHighlightsCard({ summary, highlights }: Props) {
  const completionValue =
    summary.totalTasks > 0
      ? `${summary.completedTasks}/${summary.totalTasks} tasks`
      : "No tasks yet";
  const overdueValue =
    highlights.overdueOpenTasks > 0
      ? `${highlights.overdueOpenTasks} open tasks`
      : "Nothing overdue";

  return (
    <Card className="h-fit self-start gap-0 rounded-[1.05rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="gap-3 border-b border-[#eee6da] px-4 pb-3 pt-3.5">
        <div className="space-y-1">
          <p className="text-[10px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Analytics Snapshot
          </p>
          <CardTitle className="font-heading text-[1rem] text-[#2f3e32]">
            Task Highlights
          </CardTitle>
          <CardDescription className="text-[12px] leading-5 text-[#7b7467]">
            A quick read on your task load, urgency, and reward progress.
          </CardDescription>
        </div>
        <CardAction className="rounded-full border border-[#eadfce] bg-[#f8f3eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7c60]">
          LIVE
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-3">
        <div className="rounded-[0.95rem] border border-[#e9e1d4] bg-[#f8f4ed] px-3 py-3">
          <p className="text-[10px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
            Next Upcoming Task
          </p>
          <p className="mt-1.5 font-secondary text-[15px] font-semibold text-[#304034]">
            {highlights.nextUpcomingTaskLabel}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#6d665b]">
            {highlights.nextUpcomingTaskTime}
          </p>
        </div>

        <div className="rounded-[0.95rem] border border-[#ece4d7] bg-white px-3">
          <DetailRow
            label="Completion"
            value={`${summary.completionRate}%`}
            emphasize
          />
          <DetailRow label="Done" value={completionValue} />
          <DetailRow
            label="Busiest Day"
            value={`${highlights.busiestWeekdayLabel} · ${highlights.busiestWeekdayCount}`}
          />
          <DetailRow
            label="Top Priority Mix"
            value={`${highlights.topPriorityLabel} · ${highlights.topPriorityCount}`}
          />
          <DetailRow label="Overdue" value={overdueValue} />
          <DetailRow label="Task XP Earned" value={`${highlights.xpEarned} XP`} emphasize />
        </div>
      </CardContent>
    </Card>
  );
}
