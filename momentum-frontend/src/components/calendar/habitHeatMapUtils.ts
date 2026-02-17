export const WEEKDAY_LABELS = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;

export const getProgressForDay = (
  dayNumber: number,
  totalDays: number,
  progressData: number[],
): number => {
  if (dayNumber < 1 || dayNumber > totalDays) return 0;
  return progressData[dayNumber - 1] ?? 0;
};
