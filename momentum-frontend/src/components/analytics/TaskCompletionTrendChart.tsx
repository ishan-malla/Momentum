import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TaskCompletionTrendPoint } from "@/features/tasks/taskAnalytics";

const chartConfig = {
  scheduled: {
    label: "Scheduled",
    color: "#c9ab76",
  },
  completed: {
    label: "Completed",
    color: "#6f8d6e",
  },
} satisfies ChartConfig;

type Props = {
  data: TaskCompletionTrendPoint[];
};

export default function TaskCompletionTrendChart({ data }: Props) {
  const scheduledTotal = data.reduce((sum, point) => sum + point.scheduled, 0);
  const completedTotal = data.reduce((sum, point) => sum + point.completed, 0);
  const averageCompletion =
    scheduledTotal > 0 ? Math.round((completedTotal / scheduledTotal) * 100) : 0;

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          Task Completion Trend
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          Scheduled vs completed tasks over the last {data.length} days. Average
          completion: {averageCompletion}%.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[260px]">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7dfd2" />
            <XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={24}
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
                  labelFormatter={(label) => `${label}`}
                  valueFormatter={(value) => `${value} tasks`}
                />
              }
              cursor={{ fill: "rgba(97,129,100,0.06)" }}
            />
            <Bar
              dataKey="scheduled"
              fill="var(--color-scheduled)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
