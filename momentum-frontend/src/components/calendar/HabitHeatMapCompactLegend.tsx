const LEGEND_ITEMS = [
  {
    label: "Perfect",
    className: "bg-primary",
  },
  {
    label: "Partial",
    className: "bg-primary/20",
  },
] as const;

type HabitHeatMapCompactLegendProps = {
  streakLabel?: string;
};

const HabitHeatMapCompactLegend = ({ streakLabel }: HabitHeatMapCompactLegendProps) => {
  return (
    <div className="px-2 pb-1 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <div className="flex items-center gap-4">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-[4px] ${item.className}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        {streakLabel ? (
          <span className="text-[10px] font-medium normal-case text-muted-foreground">
            {streakLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default HabitHeatMapCompactLegend;
