import * as React from "react";
import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

type TooltipItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: React.ReactNode;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

const useChart = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("Chart components must be used inside ChartContainer.");
  }
  return context;
};

const getSeriesKey = (item: TooltipItem) =>
  String(item.dataKey ?? item.name ?? "value");

const getSeriesColor = (item: TooltipItem, config: ChartConfig) =>
  item.color ?? config[getSeriesKey(item)]?.color ?? "var(--color-primary)";

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactElement;
  }
>(({ className, config, children, style, ...props }, ref) => {
  const chartStyle = Object.entries(config).reduce(
    (values, [key, item]) => {
      if (item.color) values[`--color-${key}`] = item.color;
      return values;
    },
    {} as Record<string, string>,
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("h-[260px] w-full text-xs", className)}
        style={{ ...chartStyle, ...style } as React.CSSProperties}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = RechartsTooltip;

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    hideLabel?: boolean;
    label?: React.ReactNode;
    payload?: TooltipItem[];
    labelFormatter?: (label: React.ReactNode) => React.ReactNode;
    valueFormatter?: (
      value: React.ReactNode,
      item: TooltipItem,
    ) => React.ReactNode;
  }
>(
  (
    {
      active,
      className,
      hideLabel = false,
      label,
      payload,
      labelFormatter,
      valueFormatter,
      ...props
    },
    ref,
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[180px] gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg",
          className,
        )}
        {...props}
      >
        {!hideLabel ? (
          <div className="font-medium text-foreground">
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        ) : null}

        <div className="grid gap-1.5">
          {payload.map((item) => {
            const key = getSeriesKey(item);
            const itemConfig = config[key];

            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ backgroundColor: getSeriesColor(item, config) }}
                  />
                  <span>{itemConfig?.label ?? item.name ?? key}</span>
                </div>
                <span className="font-medium text-foreground">
                  {valueFormatter ? valueFormatter(item.value, item) : item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

ChartTooltipContent.displayName = "ChartTooltipContent";
