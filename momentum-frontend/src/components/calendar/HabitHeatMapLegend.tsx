import { useState } from "react";
import HabitHeatMapCircularProgress from "./HabitHeatMapCircularProgress";

const LEGEND_ITEMS = [
  { percentage: 0, label: "Not started" },
  { percentage: 13, label: "1-25%" },
  { percentage: 38, label: "26-50%" },
  { percentage: 63, label: "51-75%" },
  { percentage: 88, label: "76-99%" },
  { percentage: 100, label: "Complete" },
] as const;

const HabitHeatMapLegend = () => {
  const [showDeletedHabitsInfo, setShowDeletedHabitsInfo] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground/80">Legend</p>

        <div className="group relative">
          <button
            type="button"
            onClick={() => setShowDeletedHabitsInfo((previous) => !previous)}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground/65 transition-colors hover:bg-accent hover:text-muted-foreground"
            aria-label="Heatmap information"
            aria-expanded={showDeletedHabitsInfo}
          >
            i
          </button>
          <div
            className={`pointer-events-none absolute right-0 top-7 z-20 w-56 rounded-md border border-border bg-card px-3 py-2 text-[11px] leading-relaxed text-muted-foreground shadow-sm transition-opacity sm:w-64 ${
              showDeletedHabitsInfo
                ? "visible opacity-100"
                : "invisible opacity-0 group-hover:visible group-hover:opacity-100"
            }`}
          >
            Heatmap also includes progress from habits that were later deleted.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <HabitHeatMapCircularProgress
              percentage={item.percentage}
              size={12}
              className="h-3 w-3"
              animate={false}
              showEmpty
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitHeatMapLegend;
