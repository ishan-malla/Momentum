import type { RefObject } from "react";
import type { CalendarDay } from "@/hooks/useCalendarHook";
import HabitHeatMapCircularProgress from "./HabitHeatMapCircularProgress";

type Props = {
  day: CalendarDay;
  percentage: number;
  todayRef: RefObject<HTMLDivElement | null>;
};

export const HabitHeatMapEmptyCell = () => {
  return <div className="aspect-square rounded-md sm:rounded-lg" />;
};

export default function HabitHeatMapDayCell({ day, percentage, todayRef }: Props) {
  return (
    <div
      ref={day.isToday ? todayRef : null}
      className={`relative aspect-square rounded-md text-xs sm:rounded-lg ${
        day.isToday ? "border-2 border-warning" : "border border-border"
      } ${day.isFuture ? "bg-muted/40" : ""}`}
    >
      {day.isToday && (
        <div className="pointer-events-none absolute inset-0 rounded-md bg-warning/15 sm:rounded-lg" />
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-between py-1.5 sm:py-3">
        <div
          className={`text-[10px] font-medium leading-none sm:text-sm ${
            day.isFuture ? "text-muted-foreground/50" : "text-muted-foreground"
          }`}
        >
          {day.dayNumber}
        </div>

        <div className="flex flex-1 items-center justify-center">
          {day.isFuture ? (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <div className="h-0.5 w-5 rounded-full bg-muted-foreground/30 sm:w-6" />
              <div className="h-0.5 w-2 rounded-full bg-muted-foreground/30" />
            </div>
          ) : (
            <HabitHeatMapCircularProgress percentage={percentage} />
          )}
        </div>

        <div
          className={`hidden text-[10px] font-semibold leading-none sm:block ${
            day.isFuture ? "invisible" : "text-muted-foreground/80"
          }`}
        >
          {`${percentage}%`}
        </div>
      </div>
    </div>
  );
}
