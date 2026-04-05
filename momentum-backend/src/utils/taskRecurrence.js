const parseDateParts = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
};

const toDateFromValue = (value) => {
  const parts = parseDateParts(value);
  if (!parts) return null;
  return new Date(parts.year, parts.month, parts.day);
};

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const offsetFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offsetFromMonday);
  return start;
};

export const getOccurrenceKeyForDate = (frequency, occurrenceDate) => {
  const date = toDateFromValue(occurrenceDate);
  if (!date) return occurrenceDate;

  if (frequency === "daily") return occurrenceDate;
  if (frequency === "monthly") return getMonthKey(date);
  return formatDateValue(getStartOfWeek(date));
};

export const getCompletionHistoryObject = (task) => {
  const currentHistory =
    task?.completionHistory instanceof Map
      ? Object.fromEntries(task.completionHistory.entries())
      : task?.completionHistory && typeof task.completionHistory === "object"
        ? task.completionHistory
        : {};

  if (Object.keys(currentHistory).length > 0) {
    return currentHistory;
  }

  if (!task?.completed) return {};

  const legacyDateValue =
    task.completedAt instanceof Date && !Number.isNaN(task.completedAt.getTime())
      ? formatDateValue(task.completedAt)
      : task.scheduledDate;
  const occurrenceKey = getOccurrenceKeyForDate(task.frequency, legacyDateValue);

  return {
    [occurrenceKey]:
      task.completedAt instanceof Date ? task.completedAt.toISOString() : new Date().toISOString(),
  };
};

export const getOccurrenceCompletion = (task, occurrenceDate) => {
  const occurrenceKey = getOccurrenceKeyForDate(task.frequency, occurrenceDate);
  const completedAt = getCompletionHistoryObject(task)[occurrenceKey];

  return {
    occurrenceKey,
    completed: Boolean(completedAt),
    completedAt,
  };
};

export const doesTaskOccurOnDate = (task, occurrenceDate) => {
  const anchorDate = toDateFromValue(task.scheduledDate);
  const date = toDateFromValue(occurrenceDate);
  if (!anchorDate || !date) return false;

  const normalizedAnchor = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate(),
  );
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (normalizedDate.getTime() < normalizedAnchor.getTime()) return false;

  if (task.frequency === "daily") return true;
  if (task.frequency === "weekly") {
    return normalizedDate.getDay() === normalizedAnchor.getDay();
  }

  return normalizedDate.getDate() === normalizedAnchor.getDate();
};

export const isOccurrenceCompletionAllowed = (
  task,
  occurrenceDate,
  now = new Date(),
) => {
  const occurrence = toDateFromValue(occurrenceDate);
  if (!occurrence || !doesTaskOccurOnDate(task, occurrenceDate)) return false;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (task.frequency === "daily") {
    return formatDateValue(today) === occurrenceDate;
  }

  if (task.frequency === "weekly") {
    return (
      getStartOfWeek(today).getTime() === getStartOfWeek(occurrence).getTime()
    );
  }

  return (
    today.getFullYear() === occurrence.getFullYear() &&
    today.getMonth() === occurrence.getMonth()
  );
};

export const summarizeTaskCompletion = (task) => {
  const entries = Object.entries(getCompletionHistoryObject(task))
    .filter(([, completedAt]) => typeof completedAt === "string" && completedAt.length > 0)
    .sort((left, right) => left[0].localeCompare(right[0]));
  const latest = entries[entries.length - 1]?.[1];

  return {
    completed: entries.length > 0,
    completedAt: latest,
    completionHistory: Object.fromEntries(entries),
  };
};
