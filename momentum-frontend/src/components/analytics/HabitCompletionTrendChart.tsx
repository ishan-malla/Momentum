import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { HabitCompletionTrendPoint } from "@/features/habit/habitAnalytics";

const chartConfig = {
  completionRate: {
    label: "Completion rate",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

type HabitCompletionTrendChartProps = {
  data: HabitCompletionTrendPoint[];
};

const HabitCompletionTrendChart = ({
  data,
}: HabitCompletionTrendChartProps) => {
  const average =
    data.length > 0
      ? Math.round(
          data.reduce((sum, point) => sum + point.completionRate, 0) / data.length,
        )
      : 0;

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          Completion Trend
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          Daily habit completion over the last {data.length} days. Average:{" "}
          {average}%.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[250px]">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7dfd2" />
            <XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={24}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
              width={44}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `${label}`}
                  valueFormatter={(value) => `${value}%`}
                />
              }
              cursor={{ stroke: "#d8d1c4", strokeDasharray: "4 4" }}
            />
            <Line
              dataKey="completionRate"
              dot={false}
              stroke="var(--color-completionRate)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HabitCompletionTrendChart;
