import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PomodoroHeader from "@/components/timer/PomodoroHeader";
import PomodoroSettingsModal, {
  type PomodoroDraftSettings,
} from "@/components/timer/PomodoroSettingsModal";
import PomodoroStats from "@/components/timer/PomodoroStats";
import PomodoroTimerCard from "@/components/timer/PomodoroTimerCard";
import TodaysSessions from "@/components/timer/TodaysSessions";
import {
  type PomodoroSettings,
  type PomodoroDashboard,
  useCreatePomodoroSessionMutation,
  useUpdatePomodoroSettingsMutation,
} from "@/features/pomodoro/pomodoroApiSlice";
import { coerceMinutes } from "@/components/timer/utils";
import {
  type PomodoroRuntimeSettings,
  usePomodoroEngine,
} from "@/components/timer/usePomodoroEngine";
import { setAlarmMuted } from "@/components/timer/alarmSound";

type Props = {
  dashboard: PomodoroDashboard;
};

const toDraft = (settings: PomodoroRuntimeSettings): PomodoroDraftSettings => ({
  workDurationMin: String(settings.focusDurationMin),
  breakDurationMin: String(settings.breakDurationMin),
  longBreakDurationMin: String(settings.longBreakDurationMin),
  sessionsUntilLongBreak: String(settings.sessionsUntilLongBreak),
});

const fromApiSettings = (settings: PomodoroSettings): PomodoroRuntimeSettings => ({
  focusDurationMin: settings.focusDurationMin,
  breakDurationMin: settings.breakDurationMin,
  longBreakDurationMin: settings.longBreakDurationMin,
  sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
});
const MIN_XP_ELIGIBLE_FOCUS_MINUTES = 5;

export default function PomodoroTimerContent({ dashboard }: Props) {
  const initialSettings: PomodoroRuntimeSettings = useMemo(
    () => ({
      focusDurationMin: dashboard.settings.focusDurationMin,
      breakDurationMin: dashboard.settings.breakDurationMin,
      longBreakDurationMin: dashboard.settings.longBreakDurationMin,
      sessionsUntilLongBreak: dashboard.settings.sessionsUntilLongBreak,
    }),
    [dashboard.settings],
  );

  const [settings, setSettings] = useState<PomodoroRuntimeSettings>(initialSettings);
  const [soundEnabled, setSoundEnabled] = useState(dashboard.settings.soundEnabled);
  const [showSettings, setShowSettings] = useState(false);
  const [draftSettings, setDraftSettings] = useState<PomodoroDraftSettings>(
    toDraft(initialSettings),
  );

  const [createPomodoroSession] = useCreatePomodoroSessionMutation();
  const [updatePomodoroSettings, { isLoading: isSavingSettings }] =
    useUpdatePomodoroSettingsMutation();

  const notifyCompletion = (mode: "work" | "break") => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const title =
      mode === "work" ? "Focus session complete" : "Break session complete";
    const body =
      mode === "work"
        ? "Time to start your break."
        : "Time to start your next focus session.";
    const show = () => new Notification(title, { body, tag: "pomodoro-complete" });

    if (Notification.permission === "granted") {
      show();
      return;
    }

    if (Notification.permission === "default") {
      void Notification.requestPermission().then((permission) => {
        if (permission === "granted") show();
      });
    }
  };

  const engine = usePomodoroEngine({
    initialSettings: settings,
    initialFocusCycles:
      dashboard.stats.sessionsCompleted % settings.sessionsUntilLongBreak,
    soundEnabled,
    onSaveSession: async (payload) => {
      const response = await createPomodoroSession(payload).unwrap();

      if (payload.type !== "focus") return;
      if (response.xpEarned > 0) return;

      toast.warning("No XP earned for this session", {
        description: `Focus sessions shorter than ${MIN_XP_ELIGIBLE_FOCUS_MINUTES} minutes do not grant XP.`,
      });
    },
    onSessionSaveError: (mode) => {
      toast.error(`Could not save ${mode === "work" ? "focus" : "break"} session`);
    },
    onSessionCompleted: (mode) => {
      const doneLabel = mode === "work" ? "Focus" : "Break";
      const description =
        mode === "work"
          ? "Break started automatically."
          : "Focus started automatically.";
      toast.success(`${doneLabel} session complete`, {
        description,
      });
      notifyCompletion(mode);
    },
  });

  const ringRadius = 45;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - engine.progress);

  useEffect(() => {
    setAlarmMuted(!soundEnabled);
  }, [soundEnabled]);

  const applySettings = async () => {
    const nextSettings: PomodoroRuntimeSettings = {
      focusDurationMin: coerceMinutes(
        Number.parseInt(draftSettings.workDurationMin, 10),
        1,
        60,
      ),
      breakDurationMin: coerceMinutes(
        Number.parseInt(draftSettings.breakDurationMin, 10),
        1,
        30,
      ),
      longBreakDurationMin: coerceMinutes(
        Number.parseInt(draftSettings.longBreakDurationMin, 10),
        1,
        60,
      ),
      sessionsUntilLongBreak: coerceMinutes(
        Number.parseInt(draftSettings.sessionsUntilLongBreak, 10),
        1,
        12,
      ),
    };

    try {
      const response = await updatePomodoroSettings({
        ...nextSettings,
        soundEnabled,
      }).unwrap();

      const persistedSettings = fromApiSettings(response.settings);
      setSettings(persistedSettings);
      setSoundEnabled(response.settings.soundEnabled);
      setDraftSettings(toDraft(persistedSettings));
      engine.syncCurrentModeWithSettings(persistedSettings);
      setShowSettings(false);
    } catch {
      toast.error("Could not update pomodoro settings");
    }
  };

  return (
    <div>
      <PomodoroSettingsModal
        open={showSettings}
        draft={draftSettings}
        onChange={(next) => setDraftSettings(next)}
        onClose={() => setShowSettings(false)}
        onApply={applySettings}
      />

      <PomodoroHeader
        onToggleSettings={() => {
          setShowSettings((prev) => {
            const next = !prev;
            if (next) setDraftSettings(toDraft(settings));
            return next;
          });
        }}
        showSettings={showSettings}
      />

      <main className="mx-auto w-full xl:max-w-6xl space-y-8 px-4 py-8 sm:px-5 xl:px-0">
        <PomodoroTimerCard
          mode={engine.mode}
          isRunning={engine.isRunning}
          displayMinutes={engine.displayMinutes}
          displaySeconds={engine.displaySeconds}
          ringRadius={ringRadius}
          ringCircumference={ringCircumference}
          ringOffset={ringOffset}
          soundEnabled={soundEnabled}
          workDurationMin={settings.focusDurationMin}
          breakDurationMin={
            engine.mode === "break" ? engine.sessionDurationMin : settings.breakDurationMin
          }
          onStartPause={() => {
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "default"
            ) {
              void Notification.requestPermission();
            }
            engine.onStartPause();
          }}
          onReset={engine.onReset}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onSwitchToFocus={engine.switchToFocus}
          onSwitchToBreak={engine.switchToBreak}
        />

        <PomodoroStats
          sessionsCompleted={dashboard.stats.sessionsCompleted}
          focusMinutes={dashboard.stats.focusMinutes}
          xpEarned={dashboard.stats.xpEarned}
        />

        <TodaysSessions sessions={dashboard.sessions} />

        {isSavingSettings && (
          <div className="text-xs text-muted-foreground">Saving settings...</div>
        )}
      </main>
    </div>
  );
}
