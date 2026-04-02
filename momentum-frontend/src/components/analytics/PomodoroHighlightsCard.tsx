import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  PomodoroAnalyticsHighlights,
  PomodoroAnalyticsSummary,
} from "@/features/pomodoro/pomodoroAnalytics";

type Props = {
  days: number;
  summary: PomodoroAnalyticsSummary;
  highlights: PomodoroAnalyticsHighlights;
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

const formatRatio = (
  ratio: number | null,
  breakMinutes: number,
  focusMinutes: number,
) => {
  if (ratio !== null) return `${ratio} : 1`;
  if (focusMinutes > 0 && breakMinutes === 0) return "All focus logged";
  return "No balance yet";
};

export default function PomodoroHighlightsCard({
  days,
  summary,
  highlights,
}: Props) {
  const bestDayTitle = highlights.bestFocusDayLabel ?? "No focus sessions yet";
  const bestDayDescription = highlights.bestFocusDayLabel
    ? `${highlights.bestFocusDayMinutes} focused minutes in your strongest single day.`
    : "Finish a few focus blocks and your best day will show up here.";
  const strongestWeekday = highlights.strongestWeekdayLabel
    ? `${highlights.strongestWeekdayLabel} · ${highlights.strongestWeekdayMinutes} min`
    : "Still building";
  const preferredWindow = highlights.preferredWindowLabel
    ? `${highlights.preferredWindowLabel} · ${highlights.preferredWindowSessions} sessions`
    : "Still learning";

  return (
    <Card className="h-fit self-start gap-0 rounded-[1.05rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="gap-3 border-b border-[#eee6da] px-4 pb-3 pt-3.5">
        <div className="space-y-1">
          <p className="text-[10px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
            Analytics Snapshot
          </p>
          <CardTitle className="font-heading text-[1rem] text-[#2f3e32]">
            Pomodoro Highlights
          </CardTitle>
          <CardDescription className="text-[12px] leading-5 text-[#7b7467]">
            A read on your recent focus rhythm and recovery balance.
          </CardDescription>
        </div>
        <CardAction className="rounded-full border border-[#eadfce] bg-[#f8f3eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7c60]">
          {days}D
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-3">
        <div className="rounded-[0.95rem] border border-[#e9e1d4] bg-[#f8f4ed] px-3 py-3">
          <p className="text-[10px] font-secondary uppercase tracking-[0.12em] text-[#9c8b6d]">
            Best Focus Day
          </p>
          <p className="mt-1.5 font-secondary text-[15px] font-semibold text-[#304034]">
            {bestDayTitle}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#6d665b]">
            {bestDayDescription}
          </p>
        </div>

        <div className="rounded-[0.95rem] border border-[#ece4d7] bg-white px-3">
          <DetailRow
            label="On Target"
            value={`${summary.onTargetRate}% of sessions`}
            emphasize
          />
          <DetailRow
            label="Live Streak"
            value={`${summary.currentFocusStreak} days`}
            emphasize
          />
          <DetailRow label="Best Run" value={`${summary.bestFocusStreak} days`} />
          <DetailRow label="Strongest Weekday" value={strongestWeekday} />
          <DetailRow label="Preferred Window" value={preferredWindow} />
          <DetailRow
            label="Focus / Break"
            value={formatRatio(
              highlights.focusToBreakRatio,
              summary.breakMinutes,
              summary.focusMinutes,
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
