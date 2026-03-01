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
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
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
