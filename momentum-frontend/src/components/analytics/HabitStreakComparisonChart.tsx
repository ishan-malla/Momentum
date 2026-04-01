import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { HabitStreakComparison } from "@/features/habit/habitAnalytics";

const chartConfig = {
  currentStreak: {
    label: "Current streak",
    color: "var(--color-primary)",
  },
  bestStreak: {
    label: "Best streak",
    color: "var(--color-streak)",
  },
} satisfies ChartConfig;

type HabitStreakComparisonChartProps = {
  data: HabitStreakComparison[];
};

const HabitStreakComparisonChart = ({
  data,
}: HabitStreakComparisonChartProps) => {
  if (data.length === 0) {
    return (
      <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
        <CardHeader className="space-y-1 px-5 py-5">
          <CardTitle className="font-heading text-xl text-[#2f3e32]">
            Current Vs Best Streak
          </CardTitle>
          <p className="text-sm text-[#7b7467]">
            Create a few habits first and this chart will compare their live
            streaks with their personal best.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          Current Vs Best Streak
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          Your top habit streaks right now compared with their personal best.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[260px]">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7dfd2" />
            <XAxis
              axisLine={false}
              dataKey="name"
              tickFormatter={(value) => String(value).slice(0, 8)}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
              width={34}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent valueFormatter={(value) => `${value} days`} />
              }
              cursor={{ fill: "rgba(97,129,100,0.06)" }}
            />
            <Bar
              dataKey="currentStreak"
              fill="var(--color-currentStreak)"
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="bestStreak"
              fill="var(--color-bestStreak)"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HabitStreakComparisonChart;
