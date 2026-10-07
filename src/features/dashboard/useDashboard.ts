import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardMetrics,
  fetchRecentOrders,
  fetchLowStockAlerts,
  type DashboardPeriod,
} from "./dashboardApi";

export function useDashboardMetrics(period: DashboardPeriod) {
  return useQuery({
    queryKey: ["dashboard", "metrics", period],
    queryFn: () => fetchDashboardMetrics(period),
    staleTime: 60_000, // refresh every minute, not on every focus
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ["dashboard", "recent-orders"],
    queryFn: fetchRecentOrders,
    staleTime: 30_000,
  });
}

export function useLowStockAlerts() {
  return useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: fetchLowStockAlerts,
    staleTime: 60_000,
  });
}
