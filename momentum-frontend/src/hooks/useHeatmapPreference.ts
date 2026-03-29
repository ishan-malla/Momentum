import { useEffect, useState } from "react";

export type HeatmapStyle = "compact" | "circle";

export const HEATMAP_STYLE_OPTIONS: Array<{
  value: HeatmapStyle;
  label: string;
  description: string;
}> = [
  {
    value: "compact",
    label: "Compact heatmap",
    description: "Matches the minimal tile heatmap view.",
  },
  {
    value: "circle",
    label: "Circular heatmap",
    description: "Shows the circular progress view below the heatmap.",
  },
];

const STORAGE_KEY = "momentum.heatmapStyle";
const DEFAULT_STYLE: HeatmapStyle = "compact";

const parseStyle = (value: string | null): HeatmapStyle | null => {
  if (value === "compact" || value === "circle") return value;
  if (value === "detailed") return "circle";
  return null;
};

const readStoredStyle = (): HeatmapStyle => {
  if (typeof window === "undefined") return DEFAULT_STYLE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return parseStyle(stored) ?? DEFAULT_STYLE;
};

export const useHeatmapPreference = () => {
  const [style, setStyle] = useState<HeatmapStyle>(() => readStoredStyle());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, style);
  }, [style]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const nextStyle = parseStyle(event.newValue);
      if (!nextStyle) return;
      setStyle(nextStyle);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [style, setStyle] as const;
};
