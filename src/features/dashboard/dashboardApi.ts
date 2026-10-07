import { api } from "../../lib/api";

export type DashboardPeriod = "today" | "7days" | "30days";

export interface DashboardSummary {
  totalRevenue: number;
  totalRevenueFormatted: number; // rupees — use this
  orderCount: number;
  newCustomers: number;
  avgOrderValue: number;
  avgOrderValueFormatted: number; // rupees — use this
}

export interface StatusBreakdown {
  _id: string;
  count: number;
}

export interface BestSellingProduct {
  _id: string;
  name: string;
  totalQuantitySold: number;
  totalRevenue: number; // paise
  orderCount: number;
  image?: string;
  slug?: string;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthLabel: string;
  revenue: number; // paise
  orders: number;
}

export interface DashboardMetrics {
  period: DashboardPeriod;
  summary: DashboardSummary;
  orderStatusBreakdown: StatusBreakdown[];
  paymentModeBreakdown: StatusBreakdown[];
  bestSellingProducts: BestSellingProduct[];
  monthlyTrend: MonthlyTrend[];
}

export interface RecentOrder {
  _id: string;
  orderNumber: string;
  pricing: { grandTotal: number };
  orderStatus: string;
  paymentMode: string;
  paymentStatus: string;
  createdAt: string;
  userId: { name: string; email: string } | null;
}

export interface LowStockVariant {
  _id: string;
  sku: string;
  age: string;
  color?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  product: { name: string; slug: string };
}

export const fetchDashboardMetrics = async (
  period: DashboardPeriod,
): Promise<DashboardMetrics> => {
  const { data } = await api.get("/dashboard", { params: { period } });
  return data;
};

export const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
  const { data } = await api.get("/dashboard/orders/recent");
  return data.orders;
};

export const fetchLowStockAlerts = async (): Promise<{
  count: number;
  variants: LowStockVariant[];
}> => {
  const { data } = await api.get("/dashboard/stock/low");
  return data;
};
