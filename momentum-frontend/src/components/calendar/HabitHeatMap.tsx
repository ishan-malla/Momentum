import { useRef } from "react";
import { useCalendar } from "@/hooks/useCalendarHook";
import HabitHeatMapCircularProgress from "./HabitHeatMapCircularProgress";
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
        <div className="flex items-center justify-between px-5">
          <div className="text-lg font-semibold">
            {calendar.monthName} {calendar.year}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrev}
              className="flex h-7 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
              className="flex h-7 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Next month"
            >
              →
            </button>
            {!calendar.isCurrentMonth && (
              <button
                onClick={handleTodayClick}
                className="h-7 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-accent"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {!hasData && (
          <div className="px-5 text-xs text-muted-foreground">
            No habit data for this month.
          </div>
        )}

        <div className="grid grid-cols-7 gap-3 px-2 text-center text-xs font-semibold text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3 px-2 text-center">
          {calendar.weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className="aspect-square rounded-lg"
                  />
                );
              }

              const percentage = getProgressForDay(
                day.dayNumber,
                calendar.totalDays,
                progressData,
              );

              return (
                <div
                  key={`day-${day.dayNumber}`}
                  ref={day.isToday ? todayRef : null}
                  className={`relative aspect-square rounded-lg text-xs ${
                    day.isToday
                      ? "border-2 border-warning"
                      : "border border-border"
                  } ${day.isFuture ? "bg-muted/40" : ""}`}
                >
                  {day.isToday && (
                    <div className="pointer-events-none absolute inset-0 rounded-lg bg-warning/15" />
                  )}

                  <div className="relative z-10 flex h-full flex-col items-center justify-between py-4">
                    <div
                      className={`text-xs font-medium leading-none sm:text-sm ${
                        day.isFuture
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day.dayNumber}
                    </div>

                    <div className="flex flex-1 items-center justify-center">
                      {day.isFuture ? (
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <div className="h-0.5 w-6 rounded-full bg-muted-foreground/30" />
                          <div className="h-0.5 w-2 rounded-full bg-muted-foreground/30" />
                        </div>
                      ) : (
                        <HabitHeatMapCircularProgress percentage={percentage} />
                      )}
                    </div>

                    <div
                      className={`text-[10px] font-semibold leading-none sm:text-xs ${
                        day.isFuture ? "invisible" : "text-muted-foreground/80"
                      }`}
                    >
                      {`${percentage}%`}
                    </div>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </section>

      <HabitHeatMapLegend />
    </div>
  );
};

export default HabitHeatMap;
