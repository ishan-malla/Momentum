import type { TimerMode } from "@/components/timer/pomodoroEngineTypes";

const COMPLETION_NOTIFICATION_TAG = "pomodoro-complete";

export const notifyPomodoroCompletion = (mode: TimerMode) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  const title =
    mode === "work" ? "Focus session complete" : "Break session complete";
  const body =
    mode === "work"
      ? "Time to start your break."
      : "Time to start your next focus session.";

  const showNotification = () => {
    new Notification(title, {
      body,
      tag: COMPLETION_NOTIFICATION_TAG,
    });
  };

  if (Notification.permission === "granted") {
    showNotification();
    return;
  }

  if (Notification.permission === "default") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") showNotification();
    });
  }
};

export const requestPomodoroNotificationPermission = () => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  void Notification.requestPermission();
};
