import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TaskBreakdownPoint } from "@/features/tasks/taskAnalytics";

const chartConfig = {
  count: {
    label: "Tasks",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

type Props = {
  title: string;
  description: string;
  data: TaskBreakdownPoint[];
};

export default function TaskBreakdownChart({ title, description, data }: Props) {
  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          {title}
        </CardTitle>
        <p className="text-sm text-[#7b7467]">{description}</p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        {total === 0 ? (
          <div className="rounded-[1rem] border border-[#e7dfd2] bg-[#faf6ef] px-4 py-8 text-sm text-[#7b7467]">
            No task data yet.
          </div>
        ) : (
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
                    valueFormatter={(value) => `${value} tasks`}
                  />
                }
                cursor={{ fill: "rgba(97,129,100,0.06)" }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
