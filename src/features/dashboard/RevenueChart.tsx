import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { type MonthlyTrend } from "./dashboardApi";

interface RevenueChartProps {
  data: MonthlyTrend[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    revenueRupees: Math.round(d.revenue / 100),
  }));

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h2 className="font-semibold mb-4">Revenue trend (last 6 months)</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={formatted}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
            />
            <Tooltip
              formatter={(value: any) => [
                `₹${value.toLocaleString("en-IN")}`,
                "Revenue",
              ]}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            <Bar
              dataKey="revenueRupees"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
