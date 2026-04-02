import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PomodoroFocusWindowPoint } from "@/features/pomodoro/pomodoroAnalytics";

const chartConfig = {
  focusSessions: {
    label: "Focus sessions",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

type Props = {
  data: PomodoroFocusWindowPoint[];
};

export default function PomodoroFocusWindowChart({ data }: Props) {
  const totalSessions = data.reduce((sum, point) => sum + point.focusSessions, 0);

  const getRangeText = (label: string) => {
    const matchingPoint = data.find((point) => point.label === label);
    return matchingPoint ? `${label} · ${matchingPoint.range}` : label;
  };

  if (totalSessions === 0) {
    return (
      <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
        <CardHeader className="space-y-1 px-5 py-5">
          <CardTitle className="font-heading text-xl text-[#2f3e32]">
            Focus Windows
          </CardTitle>
          <p className="text-sm text-[#7b7467]">
            Once you log a few focus sessions, this chart will show when your timer
            sessions naturally tend to start.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          Focus Windows
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          Session starts grouped by time of day so you can spot when focus feels
          easiest to enter.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[260px]">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7dfd2" />
            <XAxis
              axisLine={false}
              dataKey="label"
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
              width={36}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => getRangeText(String(label))}
                  valueFormatter={(value) => `${value} sessions`}
                />
              }
              cursor={{ fill: "rgba(97,129,100,0.06)" }}
            />
            <Bar
              dataKey="focusSessions"
              fill="var(--color-focusSessions)"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
