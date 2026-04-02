import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PomodoroDailyTrendPoint } from "@/features/pomodoro/pomodoroAnalytics";

const chartConfig = {
  focusMinutes: {
    label: "Focus minutes",
    color: "var(--color-primary)",
  },
  breakMinutes: {
    label: "Break minutes",
    color: "#d6a25d",
  },
} satisfies ChartConfig;

type Props = {
  days: number;
  data: PomodoroDailyTrendPoint[];
};

export default function PomodoroFocusTrendChart({ days, data }: Props) {
  const totalFocusMinutes = data.reduce((sum, point) => sum + point.focusMinutes, 0);
  const totalBreakMinutes = data.reduce((sum, point) => sum + point.breakMinutes, 0);
  const activeDays = data.filter((point) => point.focusSessions > 0).length;

  if (totalFocusMinutes === 0 && totalBreakMinutes === 0) {
    return (
      <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
        <CardHeader className="space-y-1 px-5 py-5">
          <CardTitle className="font-heading text-xl text-[#2f3e32]">
            Focus Rhythm
          </CardTitle>
          <p className="text-sm text-[#7b7467]">
            Finish a few sessions and this chart will map how your focus and break
            minutes move over time.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          Focus Rhythm
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          Daily focus and recovery minutes across the last {days} days. {activeDays}{" "}
          active focus days logged.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[280px]">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7dfd2" />
            <XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={22}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickFormatter={(value) => `${value}m`}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
              width={42}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  valueFormatter={(value) => `${value} min`}
                />
              }
              cursor={{ fill: "rgba(97,129,100,0.06)" }}
            />
            <Bar
              dataKey="focusMinutes"
              fill="var(--color-focusMinutes)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="breakMinutes"
              fill="var(--color-breakMinutes)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
