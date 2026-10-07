import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { type StatusBreakdown } from "./dashboardApi";

const STATUS_COLORS: Record<string, string> = {
  placed: "#3B82F6",
  confirmed: "#6366F1",
  processing: "#8B5CF6",
  shipped: "#F59E0B",
  out_for_delivery: "#F77620",
  delivered: "#10B981",
  cancelled: "#EF4444",
  returned: "#6B7280",
  rto: "#9CA3AF",
};

interface OrderStatusChartProps {
  data: StatusBreakdown[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((d) => ({
    name: d._id.replace(/_/g, " "),
    value: d.count,
    color: STATUS_COLORS[d._id] ?? "#CBD5E1",
  }));

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h2 className="font-semibold mb-4">Orders by status</h2>
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [value, name]}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
