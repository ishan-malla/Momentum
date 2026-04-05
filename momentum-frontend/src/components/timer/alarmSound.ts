type WindowWithWebkitAudioContext = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

const DEFAULT_ALARM_VOLUME = 1;
const MAX_ALARM_REPEATS = 4;

let alarmAudio: HTMLAudioElement | null = null;
let fallbackAudioContext: AudioContext | null = null;
let alarmPrimed = false;
let alarmMuted = false;
let alarmActive = false;
let alarmPlayCount = 0;
let alarmPrimeAttemptId = 0;
let activeFallbackOscillator: OscillatorNode | null = null;
let activeFallbackGain: GainNode | null = null;
let fallbackAlarmIntervalId: number | null = null;
let fallbackBeepCount = 0;
let pendingFallbackStartTimeoutId: number | null = null;

const stopFallbackBeep = () => {
  if (activeFallbackOscillator) {
    try {
      activeFallbackOscillator.stop();
    } catch {
      // oscillator may already be stopped
    }
    activeFallbackOscillator.disconnect();
    activeFallbackOscillator = null;
  }

  if (activeFallbackGain) {
    activeFallbackGain.disconnect();
    activeFallbackGain = null;
  }
};

const stopFallbackAlarmLoop = () => {
  if (pendingFallbackStartTimeoutId !== null) {
    window.clearTimeout(pendingFallbackStartTimeoutId);
    pendingFallbackStartTimeoutId = null;
  }

  if (fallbackAlarmIntervalId !== null) {
    window.clearInterval(fallbackAlarmIntervalId);
    fallbackAlarmIntervalId = null;
  }
  fallbackBeepCount = 0;
  stopFallbackBeep();
};

const getAlarmAudio = () => {
  if (!alarmAudio) {
    alarmAudio = new Audio("/sounds/pomodoroalarm.mp3");
    alarmAudio.preload = "auto";
    alarmAudio.muted = alarmMuted;
    alarmAudio.volume = alarmMuted ? 0 : DEFAULT_ALARM_VOLUME;
  }

  return alarmAudio;
};

const getFallbackAudioContext = () => {
  if (fallbackAudioContext) return fallbackAudioContext;

  const AudioContextClass =
    window.AudioContext ||
    (window as WindowWithWebkitAudioContext).webkitAudioContext;

  if (!AudioContextClass) return null;

  fallbackAudioContext = new AudioContextClass();
  return fallbackAudioContext;
};

const playFallbackBeep = () => {
  const context = getFallbackAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  activeFallbackOscillator = oscillator;
  activeFallbackGain = gainNode;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.25, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.onended = () => {
    stopFallbackBeep();
  };

  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
};

const startFallbackAlarmLoop = () => {
  if (alarmMuted || fallbackAlarmIntervalId !== null) return;

  fallbackBeepCount = 1;
  playFallbackBeep();
  fallbackAlarmIntervalId = window.setInterval(() => {
    if (!alarmActive) {
      stopFallbackAlarmLoop();
      return;
    }

    if (fallbackBeepCount >= MAX_ALARM_REPEATS) {
      alarmActive = false;
      stopFallbackAlarmLoop();
      return;
    }

    fallbackBeepCount += 1;
    playFallbackBeep();
  }, 700);
};

export const setAlarmMuted = (muted: boolean) => {
  alarmMuted = muted;

  if (alarmAudio) {
    alarmAudio.muted = muted;
    alarmAudio.volume = muted ? 0 : DEFAULT_ALARM_VOLUME;
  }

  if (muted) {
    stopFallbackAlarmLoop();
    return;
  }

  if (alarmActive && alarmAudio) {
    if (alarmAudio.paused) {
      void alarmAudio.play().catch(() => {
        startFallbackAlarmLoop();
      });
    } else {
      stopFallbackAlarmLoop();
    }
  }
};

export const primeAlarmSound = () => {
  const audio = getAlarmAudio();
  const context = getFallbackAudioContext();
  if (context && context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }

  if (alarmPrimed) return;
  alarmPrimed = true;
  audio.load();

  const primeAttemptId = ++alarmPrimeAttemptId;
  audio.muted = true;
  audio.volume = 0;

  const restoreWarmAudioState = () => {
    if (primeAttemptId !== alarmPrimeAttemptId) return;
    if (!alarmActive) {
      audio.pause();
      audio.currentTime = 0;
    }
    audio.muted = alarmMuted;
    audio.volume = alarmMuted ? 0 : DEFAULT_ALARM_VOLUME;
  };

  const playPromise = audio.play();
  if (!playPromise) {
    restoreWarmAudioState();
    return;
  }

  void playPromise.then(restoreWarmAudioState).catch(() => {
    restoreWarmAudioState();
  });
};

export const playAlarmSound = () => {
  const audio = getAlarmAudio();
  alarmPrimeAttemptId += 1;
  alarmActive = true;
  alarmPlayCount = 0;
  stopFallbackAlarmLoop();
  let mediaPlaybackStarted = false;
  audio.loop = false;
  audio.currentTime = 0;
  audio.muted = alarmMuted;
  audio.volume = alarmMuted ? 0 : DEFAULT_ALARM_VOLUME;
  audio.onplaying = () => {
    mediaPlaybackStarted = true;
    stopFallbackAlarmLoop();
  };
  audio.onended = () => {
    if (!alarmActive) return;

    alarmPlayCount += 1;
    if (alarmPlayCount >= MAX_ALARM_REPEATS) {
      alarmActive = false;
      stopFallbackAlarmLoop();
      return;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => {
      startFallbackAlarmLoop();
    });
  };

  if (!alarmMuted) {
    pendingFallbackStartTimeoutId = window.setTimeout(() => {
      if (!mediaPlaybackStarted && alarmActive) {
        startFallbackAlarmLoop();
      }
    }, 350);
  }

  void audio.play().catch(() => {
    startFallbackAlarmLoop();
  });
};

export const stopAlarmSound = () => {
  alarmPrimeAttemptId += 1;
  alarmActive = false;
  alarmPlayCount = 0;
  if (alarmAudio) {
    alarmAudio.onended = null;
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
  stopFallbackAlarmLoop();
};
