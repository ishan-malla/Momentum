import { useRef } from "react";
import { useCalendar } from "@/hooks/useCalendarHook";
import HabitHeatMapDayCell, {
  HabitHeatMapEmptyCell,
} from "./HabitHeatMapDayCell";
import HabitHeatMapLegend from "./HabitHeatMapLegend";
import {
  WEEKDAY_LABELS,
  getProgressForDay,
} from "./habitHeatMapUtils";

type HabitHeatMapProps = {
  year?: number;
  month?: number;
  progressData: number[];
  hasData?: boolean;
  today?: Date;
  minYear?: number;
  minMonth?: number;
  maxYear?: number;
  maxMonth?: number;
  onTodayClick?: () => void;
  onMonthChange?: (year: number, month: number) => void;
};

const HabitHeatMap = ({
  year,
  month,
  progressData,
  hasData = true,
  today,
  minYear,
  minMonth,
  maxYear,
  maxMonth,
  onTodayClick,
  onMonthChange,
}: HabitHeatMapProps) => {
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
    <div className="animate-fade-in flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4">
          <div className="text-base font-semibold sm:text-lg">
            {calendar.monthName} {calendar.year}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrev}
              className="flex h-7 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
              className="flex h-7 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Next month"
            >
              →
            </button>
            {!calendar.isCurrentMonth && (
              <button
                onClick={handleTodayClick}
                className="h-7 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted/60"
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
          <div className="min-w-[20rem] space-y-2 sm:min-w-0 sm:space-y-2.5">
            <div className="grid grid-cols-7 gap-1.5 px-0.5 text-center text-[10px] font-semibold text-muted-foreground sm:gap-2.5 sm:px-2 sm:text-xs">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 px-0.5 text-center sm:gap-2.5 sm:px-2">
              {calendar.weeks.map((week, weekIndex) =>
                week.days.map((day, dayIndex) => {
                  if (!day) {
                    return <HabitHeatMapEmptyCell key={`empty-${weekIndex}-${dayIndex}`} />;
                  }

                  const percentage = getProgressForDay(
                    day.dayNumber,
                    calendar.totalDays,
                    progressData,
                  );

                  return (
                    <HabitHeatMapDayCell
                      key={`day-${day.dayNumber}`}
                      day={day}
                      percentage={percentage}
                      todayRef={todayRef}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </section>

      <HabitHeatMapLegend />
    </div>
  );
};

export default HabitHeatMap;
