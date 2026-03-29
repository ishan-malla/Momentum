import {
  HEATMAP_STYLE_OPTIONS,
  useHeatmapPreference,
} from "@/hooks/useHeatmapPreference";

const HeatmapSettingsSection = () => {
  const [heatmapStyle, setHeatmapStyle] = useHeatmapPreference();

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-[15px] font-medium text-foreground sm:text-[16px]">
        Heatmap Style
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose the habit heatmap layout you want on the Habits page.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HEATMAP_STYLE_OPTIONS.map((option) => {
          const isSelected = heatmapStyle === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setHeatmapStyle(option.value)}
              aria-pressed={isSelected}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
                {isSelected ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    Selected
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Saved on this device.
      </p>
    </div>
  );
};

export default HeatmapSettingsSection;
