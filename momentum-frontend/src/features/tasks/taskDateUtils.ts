export type TaskDateParts = {
  year: number;
  month: number;
  day: number;
};

export const parseTaskDateParts = (value?: string): TaskDateParts | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
};
