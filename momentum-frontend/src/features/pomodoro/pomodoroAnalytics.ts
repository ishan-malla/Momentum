export type PomodoroAnalyticsQuery = {
  days?: number;
};

export type PomodoroAnalyticsSummary = {
  focusSessions: number;
  breakSessions: number;
  focusMinutes: number;
  breakMinutes: number;
  activeDays: number;
  averageFocusMinutes: number;
  averageBreakMinutes: number;
  currentFocusStreak: number;
  bestFocusStreak: number;
  onTargetSessions: number;
  onTargetRate: number;
  targetFocusMinutes: number;
  xpEarned: number;
};

export type PomodoroDailyTrendPoint = {
  date: string;
  label: string;
  focusMinutes: number;
  breakMinutes: number;
  focusSessions: number;
  breakSessions: number;
  xpEarned: number;
};

export type PomodoroFocusWindowPoint = {
  key: string;
  label: string;
  range: string;
  focusMinutes: number;
  focusSessions: number;
  averageDuration: number;
};

export type PomodoroSessionLengthPoint = {
  key: string;
  label: string;
  range: string;
  sessionCount: number;
  totalMinutes: number;
  averageDuration: number;
};

export type PomodoroAnalyticsHighlights = {
  bestFocusDayLabel: string | null;
  bestFocusDayMinutes: number;
  strongestWeekdayLabel: string | null;
  strongestWeekdayMinutes: number;
  preferredWindowLabel: string | null;
  preferredWindowRange: string | null;
  preferredWindowSessions: number;
  preferredWindowMinutes: number;
  focusToBreakRatio: number | null;
};

export type PomodoroAnalyticsResponse = {
  days: number;
  summary: PomodoroAnalyticsSummary;
  dailyTrend: PomodoroDailyTrendPoint[];
  focusWindowBreakdown: PomodoroFocusWindowPoint[];
  sessionLengthBreakdown: PomodoroSessionLengthPoint[];
  highlights: PomodoroAnalyticsHighlights;
};
