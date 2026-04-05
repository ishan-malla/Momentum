import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import XpActivityDisclosure from "@/components/gamification/XpActivityDisclosure";
import PomodoroHeader from "@/components/timer/PomodoroHeader";
import PomodoroSettingsModal, {
  type PomodoroDraftSettings,
} from "@/components/timer/PomodoroSettingsModal";
import PomodoroStats from "@/components/timer/PomodoroStats";
import PomodoroTaskQueue from "@/components/timer/PomodoroTaskQueue";
import PomodoroTimerCard from "@/components/timer/PomodoroTimerCard";
import TodaysSessions from "@/components/timer/TodaysSessions";
import { setAlarmMuted } from "@/components/timer/alarmSound";
import {
  MIN_XP_ELIGIBLE_FOCUS_MINUTES,
  createRuntimeSettingsFromApi,
  fromApiSettings,
  parseDraftSettings,
  toDraftSettings,
} from "@/components/timer/pomodoroSettingsMapper";
import {
  FIXED_FOCUS_XP,
  formatMultiplier,
} from "@/features/gamification/gamificationDisplay";
import {
  notifyPomodoroCompletion,
  requestPomodoroNotificationPermission,
} from "@/components/timer/pomodoroNotifications";
import { usePomodoroEngine } from "@/components/timer/usePomodoroEngine";
import type { PomodoroRuntimeSettings } from "@/components/timer/pomodoroEngineTypes";
import {
  type PomodoroDashboard,
  useCreatePomodoroSessionMutation,
  useUpdatePomodoroSettingsMutation,
} from "@/features/pomodoro/pomodoroApiSlice";

type Props = {
  dashboard: PomodoroDashboard;
};

const TIMER_RING_RADIUS = 45;

export default function PomodoroTimerContent({ dashboard }: Props) {
  const initialSettings = useMemo(() => {
    return createRuntimeSettingsFromApi(dashboard.settings);
  }, [dashboard.settings]);

  const [settings, setSettings] = useState<PomodoroRuntimeSettings>(initialSettings);
  const [soundEnabled, setSoundEnabled] = useState(dashboard.settings.soundEnabled);
  const [showSettings, setShowSettings] = useState(false);
  const [draftSettings, setDraftSettings] = useState<PomodoroDraftSettings>(
    toDraftSettings(initialSettings),
  );

  const [createPomodoroSession] = useCreatePomodoroSessionMutation();
  const [updatePomodoroSettings, { isLoading: isSavingSettings }] =
    useUpdatePomodoroSettingsMutation();

  const engine = usePomodoroEngine({
    initialSettings: settings,
    initialFocusCycles:
      dashboard.stats.sessionsCompleted % settings.sessionsUntilLongBreak,
    soundEnabled,
    onSaveSession: async (payload) => {
      const response = await createPomodoroSession(payload).unwrap();

      if (payload.type !== "focus") return;
      if (response.xpChange > 0) return;

      toast.warning("No XP earned for this session", {
        description: `Focus sessions shorter than ${MIN_XP_ELIGIBLE_FOCUS_MINUTES} minutes do not grant XP.`,
      });
    },
    onSessionSaveError: (mode) => {
      toast.error(`Could not save ${mode === "work" ? "focus" : "break"} session`);
    },
    onSessionCompleted: (mode) => {
      toast.success(`${mode === "work" ? "Focus" : "Break"} session complete`, {
        description:
          mode === "work"
            ? "Switched to Break. Press Start when ready."
            : "Switched to Focus. Press Start when ready.",
      });
      notifyPomodoroCompletion(mode);
    },
  });

  useEffect(() => {
    setAlarmMuted(!soundEnabled);
  }, [soundEnabled]);

  const applySettings = async () => {
    const nextSettings = parseDraftSettings(draftSettings);

    try {
      const response = await updatePomodoroSettings({
        ...nextSettings,
        soundEnabled,
      }).unwrap();

      const persistedSettings = fromApiSettings(response.settings);
      setSettings(persistedSettings);
      setSoundEnabled(response.settings.soundEnabled);
      setDraftSettings(toDraftSettings(persistedSettings));
      engine.syncCurrentModeWithSettings(persistedSettings);
      setShowSettings(false);
    } catch {
      toast.error("Could not update pomodoro settings");
    }
  };

  const ringCircumference = 2 * Math.PI * TIMER_RING_RADIUS;
  const ringOffset = ringCircumference * engine.progress;
  const pomodoroXpItems = [
    {
      label: "Eligible Focus Session",
      value: `${FIXED_FOCUS_XP} XP`,
      detail: `Focus sessions earn XP once they reach at least ${MIN_XP_ELIGIBLE_FOCUS_MINUTES} minutes.`,
    },
    {
      label: "Pomodoro Multiplier",
      value: formatMultiplier(1),
      detail: "Pomodoro currently uses a fixed x1.0 multiplier with no streak or duration bonus.",
    },
    {
      label: "Short Sessions",
      value: "0 XP",
      detail: `Focus sessions under ${MIN_XP_ELIGIBLE_FOCUS_MINUTES} minutes do not grant XP.`,
    },
    {
      label: "Break Sessions",
      value: "0 XP",
      detail: "Breaks are tracked for analytics, but they do not award XP.",
    },
  ];

  return (
    <div className="timer-font-scope">
      <PomodoroSettingsModal
        open={showSettings}
        draft={draftSettings}
        onChange={setDraftSettings}
        onClose={() => setShowSettings(false)}
        onApply={applySettings}
      />

      <PomodoroHeader
        xpActivityControl={
          <XpActivityDisclosure
            title="Pomodoro XP Activity"
            subtitle="See exactly how focus sessions earn XP and what multiplier applies."
            items={pomodoroXpItems}
            footnote="Longer sessions currently improve your focus stats, but not the XP multiplier."
          />
        }
      />

      <main className="mx-auto w-full space-y-6 px-4 py-6 sm:space-y-8 sm:px-5 sm:py-8 xl:max-w-7xl xl:px-0">
        <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div className="animate-drop-in">
            <PomodoroTimerCard
              mode={engine.mode}
              isRunning={engine.isRunning}
              displayMinutes={engine.displayMinutes}
              displaySeconds={engine.displaySeconds}
              ringRadius={TIMER_RING_RADIUS}
              ringCircumference={ringCircumference}
              ringOffset={ringOffset}
              soundEnabled={soundEnabled}
              workDurationMin={settings.focusDurationMin}
              breakDurationMin={
                engine.mode === "break"
                  ? engine.sessionDurationMin
                  : settings.breakDurationMin
              }
              showSettings={showSettings}
              onStartPause={() => {
                const isStartingSession = !engine.isRunning;
                engine.onStartPause();
                if (isStartingSession) {
                  requestPomodoroNotificationPermission();
                }
              }}
              onReset={engine.onReset}
              onToggleSound={() => setSoundEnabled((previous) => !previous)}
              onToggleSettings={() => {
                setShowSettings((previous) => {
                  const isOpening = !previous;
                  if (isOpening) {
                    setDraftSettings(toDraftSettings(settings));
                  }
                  return isOpening;
                });
              }}
              onSwitchToFocus={engine.switchToFocus}
              onSwitchToBreak={engine.switchToBreak}
            />
          </div>

          <div className="animate-fade-in">
            <PomodoroTaskQueue />
          </div>
        </div>

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
