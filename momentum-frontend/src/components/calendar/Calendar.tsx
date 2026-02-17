import { useEffect, useState } from "react";
import { useCalendar } from "@/hooks/useCalendarHook";

type CalendarProps = {
  year?: number;
  month?: number;
  progressData: number[];
  today?: Date;
};

// Circular progress component - specific to this heatmap calendar
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const size = 16;
  const radius = size / 2;
  const clamped = Math.min(100, Math.max(0, percentage));
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Opacity based on completion ranges
  const getFillOpacity = (pct: number) => {
    if (pct === 0) return 0;
    if (pct <= 25) return 0.25;
    if (pct <= 50) return 0.45;
    if (pct <= 75) return 0.65;
    if (pct < 100) return 0.85;
    return 1;
  };

  const fillOpacity = getFillOpacity(clamped);

  // Calculate angle for counter-clockwise fill
  const angle = isAnimated ? (clamped / 100) * 360 : 0;
  const radians = (angle * Math.PI) / 180;

  const x = radius - radius * Math.sin(radians);
  const y = radius - radius * Math.cos(radians);

  const largeArcFlag = angle > 180 ? 1 : 0;

  if (clamped === 0) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="h-4 w-4"
      aria-label={`${clamped}% complete`}
      role="img"
    >
      {clamped >= 100 ? (
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="var(--ring)"
          fillOpacity={fillOpacity}
          style={{
            transition: "fill-opacity 650ms ease-out",
          }}
        />
      ) : (
        <path
          d={`M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x} ${y} Z`}
          fill="var(--ring)"
          fillOpacity={fillOpacity}
          style={{
            transition: "d 650ms ease-out, fill-opacity 650ms ease-out",
          }}
        />
      )}
    </svg>
  );
};

const Calendar = ({ year, month, progressData, today }: CalendarProps) => {
  // ONLY use calendar hook for date calculations - this is the reusable part
  const calendar = useCalendar({ year, month, today });

  // Helper function to get percentage for a day
  const getProgressForDay = (dayNumber: number): number => {
    if (dayNumber < 1 || dayNumber > calendar.totalDays) return 0;
    return progressData[dayNumber - 1] || 0;
  };

  return (
    <div className="flex flex-col rounded-r-md p-2 sm:px-4 gap-4">
      {/* Day of week headers */}
      <div className="grid grid-cols-7 justify-between text-center text-xs font-semibold text-muted-foreground">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 justify-between text-center gap-2">
        {calendar.weeks.map((week, weekIndex) =>
          week.days.map((day, dayIndex) => {
            // Empty cell for padding
            if (!day) {
              return (
                <div
                  key={`empty-${weekIndex}-${dayIndex}`}
                  className="h-16 sm:h-22 md:h-30 rounded-md"
                />
              );
            }

            const percentage = getProgressForDay(day.dayNumber);

            return (
              <div
                key={`day-${day.dayNumber}`}
                className={`h-16 sm:h-22 md:h-30 rounded-md text-xs relative ${
                  day.isToday
                    ? "border-2 border-chart-4"
                    : "border border-border"
                }`}
              >
                {/* Today highlight background */}
                {day.isToday && (
                  <div className="absolute inset-0 bg-chart-4 opacity-20 rounded-md pointer-events-none" />
                )}

                {/* Future day overlay */}
                {day.isFuture && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-60 rounded-md pointer-events-none flex flex-col items-center justify-center gap-1">
                    <div className="bg-gray-400 w-4 h-0.5 rounded-full" />
                    <div className="bg-gray-400 w-1.5 h-0.5 rounded-full" />
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 h-full px-1 py-1.5 sm:px-2 sm:py-2 flex flex-col items-center justify-between">
                  {/* Day number at top */}
                  <div
                    className={`h-4 py-0.5 text-xs sm:h-5 sm:text-sm font-medium leading-none flex items-center ${
                      day.isToday ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {day.dayNumber}
                  </div>

                  {/* Progress indicator in centered middle slot */}
                  {!day.isFuture && (
                    <div className="flex flex-1 items-center justify-center py-0.5">
                      <CircularProgress percentage={percentage} />
                    </div>
                  )}

                  {day.isFuture && <div className="flex-1" />}

                  {/* Percentage label at bottom */}
                  <div className="h-4 py-0.5 flex items-center justify-center text-[8px] sm:text-[10px] font-semibold leading-none text-muted-foreground/80 sm:h-5">
                    {!day.isFuture ? `${percentage}%` : ""}
                  </div>
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};

export default Calendar;
