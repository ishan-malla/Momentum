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
import type { AdminUserTrendPoint } from "@/features/admin/adminApiSlice";

const chartConfig = {
  totalUsers: {
    label: "Total users",
    color: "#6f8d6e",
  },
} satisfies ChartConfig;

type Props = {
  days: number;
  data: AdminUserTrendPoint[];
};

export default function AdminUserTrendChart({ days, data }: Props) {
  const latestTotal = data[data.length - 1]?.totalUsers ?? 0;
  const newUsers = data.reduce((sum, point) => sum + point.newUsers, 0);

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          User Growth
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          {newUsers} new users joined in the last {days} days. Total users now: {latestTotal}.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent valueFormatter={(value) => `${value} users`} />
              }
              cursor={{ stroke: "#d8d1c4", strokeDasharray: "4 4" }}
            />
            <Line
              dataKey="totalUsers"
              dot={false}
              stroke="var(--color-totalUsers)"
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
}
