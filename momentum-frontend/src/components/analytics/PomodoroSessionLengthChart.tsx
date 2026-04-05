import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PomodoroSessionLengthPoint } from "@/features/pomodoro/pomodoroAnalytics";

const chartConfig = {
  sessionCount: {
    label: "Sessions",
    color: "#b87042",
  },
} satisfies ChartConfig;

type Props = {
  data: PomodoroSessionLengthPoint[];
};

export default function PomodoroSessionLengthChart({ data }: Props) {
  const totalSessions = data.reduce((sum, point) => sum + point.sessionCount, 0);

  const getRangeText = (label: string) => {
    const matchingPoint = data.find((point) => point.label === label);
    return matchingPoint ? `${label} · ${matchingPoint.range}` : label;
  };

  if (totalSessions === 0) {
    return (
      <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
        <CardHeader className="space-y-1 px-5 py-5">
          <CardTitle className="font-heading text-xl text-[#2f3e32]">
            Session Length Mix
          </CardTitle>
          <p className="text-sm text-[#7b7467]">
            This chart will fill in once your focus sessions start building a
            pattern across quick, classic, and deeper blocks.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          Session Length Mix
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          A read on how often your focus blocks stay quick, classic, or stretch
          into deeper work.
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
              cursor={{ fill: "rgba(184,112,66,0.08)" }}
            />
            <Bar
              dataKey="sessionCount"
              fill="var(--color-sessionCount)"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
