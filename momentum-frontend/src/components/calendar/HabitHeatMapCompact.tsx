import { useRef } from "react";
import { useCalendar } from "@/hooks/useCalendarHook";
import HabitHeatMapCompactLegend from "./HabitHeatMapCompactLegend";
import { getProgressForDay } from "./habitHeatMapUtils";

const COMPACT_WEEKDAY_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

type HabitHeatMapCompactProps = {
  year?: number;
  month?: number;
  progressData: number[];
  hasData?: boolean;
  today?: Date;
  streakLabel?: string;
  minYear?: number;
  minMonth?: number;
  maxYear?: number;
  maxMonth?: number;
  onTodayClick?: () => void;
  onMonthChange?: (year: number, month: number) => void;
};

const getCellTone = (percentage: number) => {
  if (percentage >= 100) {
    return "text-primary-foreground";
  }
  if (percentage > 0) {
    return "text-foreground";
  }
  return "text-muted-foreground";
};

const HabitHeatMapCompact = ({
  year,
  month,
  progressData,
  hasData = true,
  today,
  streakLabel,
  minYear,
  minMonth,
  maxYear,
  maxMonth,
  onTodayClick,
  onMonthChange,
}: HabitHeatMapCompactProps) => {
  const calendar = useCalendar({ year, month, today });
  const todayRef = useRef<HTMLDivElement>(null);
  const minMonthKey =
    minYear !== undefined && minMonth !== undefined
      ? minYear * 12 + minMonth
      : Number.NEGATIVE_INFINITY;
  const maxMonthKey =
    maxYear !== undefined && maxMonth !== undefined
      ? maxYear * 12 + maxMonth
      : Number.POSITIVE_INFINITY;
  const currentMonthKey = calendar.year * 12 + calendar.month;
  const canGoPrev = currentMonthKey - 1 >= minMonthKey;
  const canGoNext = currentMonthKey + 1 <= maxMonthKey;

  const changeMonth = (step: -1 | 1) => {
    const nextDate = new Date(calendar.year, calendar.month + step, 1);
    const nextMonthKey = nextDate.getFullYear() * 12 + nextDate.getMonth();

    if (nextMonthKey < minMonthKey || nextMonthKey > maxMonthKey) {
      return;
    }

    onMonthChange?.(nextDate.getFullYear(), nextDate.getMonth());
  };

  const handleTodayClick = () => {
    const now = today ?? new Date();
    onMonthChange?.(now.getFullYear(), now.getMonth());
    setTimeout(() => {
      todayRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 100);
    onTodayClick?.();
  };

  return (
    <div className="animate-fade-in flex flex-col gap-3">
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">
          <div className="font-heading text-base font-semibold text-foreground sm:text-lg">
            {calendar.monthName} {calendar.year}
          </div>
          <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
            <button
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrev}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-white/10"
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-white/10"
              aria-label="Next month"
            >
              ›
            </button>
            {!calendar.isCurrentMonth && (
              <button
                onClick={handleTodayClick}
                className="h-7 rounded-full border border-border px-3 text-[11px] font-medium transition-colors hover:bg-muted/60"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {!hasData && (
          <div className="px-3 text-xs text-muted-foreground sm:px-4">
            No habit data for this month.
          </div>
        )}

        <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0">
          <div className="mx-auto w-full max-w-[280px] space-y-2 sm:max-w-[320px]">
            <div className="grid grid-cols-7 gap-1 px-0.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 sm:gap-1.5 sm:px-2 sm:text-[10px]">
              {COMPACT_WEEKDAY_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 px-0.5 text-center sm:gap-2 sm:px-2">
              {calendar.weeks.map((week, weekIndex) =>
                week.days.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="aspect-square"
                      />
                    );
                  }

                  const percentage = getProgressForDay(
                    day.dayNumber,
                    calendar.totalDays,
                    progressData,
                  );

                  const tone = day.isFuture
                    ? "text-muted-foreground/50"
                    : getCellTone(percentage);

                  const filled =
                    !day.isFuture && percentage > 0 ? "bg-primary/20" : "";
                  const background =
                    !day.isFuture && percentage >= 100 ? "bg-primary" : filled;

                  return (
                    <div
                      key={`day-${day.dayNumber}`}
                      ref={day.isToday ? todayRef : null}
                      className={`relative flex aspect-square items-center justify-center rounded-[8px] text-[10px] font-medium sm:text-[11px] ${tone} ${
                        background
                      } ${day.isToday ? "ring-1 ring-warning/50" : ""}`}
                    >
                      <span
                        className={`relative z-10 ${
                          percentage >= 100 ? "text-primary-foreground" : ""
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </section>

      <HabitHeatMapCompactLegend streakLabel={streakLabel} />
    </div>
  );
};

export default HabitHeatMapCompact;
