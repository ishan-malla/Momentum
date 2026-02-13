export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const coerceMinutes = (raw: number, min: number, max: number) => {
  if (!Number.isFinite(raw)) return min;
  const value = Math.trunc(raw);
  return Math.min(max, Math.max(min, value));
};

export const formatTime = (date: Date) => {
  let hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  hours = hours || 12;
  const minsStr = mins < 10 ? `0${mins}` : String(mins);
  return `${hours}:${minsStr} ${ampm}`;
};

