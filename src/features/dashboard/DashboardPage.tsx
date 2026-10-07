import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import {
  useDashboardMetrics,
  useRecentOrders,
  useLowStockAlerts,
} from "./useDashboard";
import { type DashboardPeriod } from "./dashboardApi";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { OrderStatusChart } from "./OrderStatusChart";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";
import { formatMoney } from "../../lib/format";

const PERIODS: { label: string; value: DashboardPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<DashboardPeriod>("30days");
  const { data: metrics, isLoading } = useDashboardMetrics(period);
  const { data: recentOrders } = useRecentOrders();
  const { data: lowStock } = useLowStockAlerts();

  return (
    <div className="space-y-6">
      {/* Header + period switcher */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">
            Welcome back — here's what's happening.
          </p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm transition-colors
                ${
                  period === p.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted hover:bg-bg"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Low stock alert banner — only show if there are issues */}
      {lowStock && lowStock.count > 0 && (
        <div
          onClick={() => navigate("/products")}
          className="flex items-center gap-3 px-4 py-3 bg-accent/20 border 
          border-accent rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
        >
          <AlertTriangle size={18} className="text-foreground shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">
              {lowStock.count} variant{lowStock.count === 1 ? "" : "s"}
            </span>{" "}
            are at or below their low stock threshold — check inventory.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total revenue"
          value={
            isLoading
              ? "—"
              : `₹${metrics!.summary.totalRevenueFormatted.toLocaleString("en-IN")}`
          }
          sub="From paid orders"
          icon={IndianRupee}
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Orders"
          value={isLoading ? "—" : String(metrics!.summary.orderCount)}
          sub="Excluding cancelled/returned"
          icon={ShoppingBag}
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="New customers"
          value={isLoading ? "—" : String(metrics!.summary.newCustomers)}
          sub="Registered in period"
          icon={Users}
          iconColor="text-green-600"
        />
        <StatCard
          label="Avg. order value"
          value={
            isLoading
              ? "—"
              : `₹${metrics!.summary.avgOrderValueFormatted.toLocaleString("en-IN")}`
          }
          sub="From paid orders"
          icon={TrendingUp}
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={metrics?.monthlyTrend ?? []} />
        </div>
        <div>
          <OrderStatusChart data={metrics?.orderStatusBreakdown ?? []} />
        </div>
      </div>

      {/* Best selling + recent orders + low stock grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Best selling products */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Best selling products</h2>
          {!metrics?.bestSellingProducts.length ? (
            <p className="text-sm text-muted">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {metrics.bestSellingProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-xs text-muted font-data w-4">
                    {i + 1}
                  </span>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover ring-1 ring-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-bg ring-1 ring-border flex items-center justify-center shrink-0">
                      <Package size={14} className="text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted font-data">
                      {p.totalQuantitySold} sold · {formatMoney(p.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent orders</h2>
            <button
              onClick={() => navigate("/orders")}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {!recentOrders?.length ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate("/orders")}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-bg cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-data font-semibold text-primary">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-muted">
                      {order.userId?.name ?? "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-data">
                      {formatMoney(order.pricing.grandTotal)}
                    </div>
                    <div className="mt-0.5">
                      <OrderStatusBadge status={order.orderStatus as any} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock table */}
      {lowStock && lowStock.count > 0 && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-accent-foreground" />
            Low stock variants ({lowStock.count})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted font-medium">
                    Product
                  </th>
                  <th className="text-left py-2 px-3 text-muted font-medium">
                    SKU
                  </th>
                  <th className="text-left py-2 px-3 text-muted font-medium">
                    Age
                  </th>
                  <th className="text-left py-2 px-3 text-muted font-medium">
                    Color
                  </th>
                  <th className="text-left py-2 px-3 text-muted font-medium font-data">
                    Stock
                  </th>
                  <th className="text-left py-2 px-3 text-muted font-medium font-data">
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStock.variants.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="py-2.5 px-3 font-medium">
                      {v.product.name}
                    </td>
                    <td className="py-2.5 px-3 font-data text-muted">
                      {v.sku}
                    </td>
                    <td className="py-2.5 px-3">{v.age} yrs</td>
                    <td className="py-2.5 px-3">{v.color ?? "—"}</td>
                    <td
                      className={`py-2.5 px-3 font-data font-semibold ${
                        v.stockQuantity === 0
                          ? "text-red-500 dark:text-red-400"
                          : "text-foreground"
                      }`}
                    >
                      {v.stockQuantity === 0 ? "Out of stock" : v.stockQuantity}
                    </td>
                    <td className="py-2.5 px-3 font-data text-muted">
                      {v.lowStockThreshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
