import { useMemo } from "react";

export type CalendarDay = {
  dayNumber: number;
  date: Date;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
};

export type CalendarWeek = {
  days: (CalendarDay | null)[];
};

export type UseCalendarOptions = {
  year?: number;
  month?: number;
  today?: Date;
};

export type UseCalendarReturn = {
  weeks: CalendarWeek[];
  year: number;
  month: number;
  monthName: string;
  totalDays: number;
  firstDayOfWeek: number;
  today: Date;
  isCurrentMonth: boolean;
};

export function useCalendar(
  options: UseCalendarOptions = {},
): UseCalendarReturn {
  const today = useMemo(() => options.today || new Date(), [options.today]);
  const year = options.year ?? today.getFullYear();
  const month = options.month ?? today.getMonth();

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const isCurrentMonth =
      year === today.getFullYear() && month === today.getMonth();
    const monthName = firstDay.toLocaleString("default", { month: "long" });

    const weeks: CalendarWeek[] = [];
    let currentWeek: (CalendarDay | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const date = new Date(year, month, dayNum);
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const normalizedToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const isToday = normalizedDate.getTime() === normalizedToday.getTime();
      const isPast = normalizedDate < normalizedToday;
      const isFuture = normalizedDate > normalizedToday;

      currentWeek.push({
        dayNumber: dayNum,
        date,
        isToday,
        isPast,
        isFuture,
        isCurrentMonth: true,
      });

      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push({ days: currentWeek });
    }

    return {
      weeks,
      year,
      month,
      monthName,
      totalDays,
      firstDayOfWeek,
      today,
      isCurrentMonth,
    };
  }, [year, month, today]);

  return calendarData;
}
