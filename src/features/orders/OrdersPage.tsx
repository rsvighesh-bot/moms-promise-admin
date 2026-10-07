import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Truck } from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useOrdersList } from "./useOrders";
import { type Order, type OrderStatus } from "./orderApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";
import { ShippingRateCalculator } from "./ShippingRateCalculator";
import { PickupRequestModal } from "./PickupRequestModal";
import { formatMoney } from "../../lib/format";
import { api } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

// Fetch count of orders in "processing" status (shipments ready for pickup)
function useProcessingCount() {
  return useQuery({
    queryKey: ["orders", "processing-count"],
    queryFn: async () => {
      const { data } = await api.get("/orders/admin", {
        params: { status: "processing", limit: 1, page: 1 },
      });
      return (data.total ?? 0) as number;
    },
    staleTime: 30_000,
  });
}

// src/features/orders/OrdersPage.tsx
const ORDER_STATUSES: OrderStatus[] = [
  "placed", "confirmed", "packed", "processing", "shipped",
  "out_for_delivery", "delivered", "cancelled",
  "return_requested", "return_approved", "return_rejected",
  "returned", "refunded", "rto",
];

export function OrdersPage() {
  const navigate = useNavigate();
  const { filters, page, setFilters, setPage } = useFilterParams({
    orderStatus: "", paymentMode: "", paymentStatus: "", search: "", from: "", to: "",
  });
  const { data, isLoading } = useOrdersList(filters, page);


  console.log(data, "k")
  const { data: processingCount = 0 } = useProcessingCount();
  const [pickupOpen, setPickupOpen] = useState(false);

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      header: "Order",
      render: (row) => (
        <div>
          <div className="font-data font-semibold text-primary">{row.orderNumber}</div>
          <div className="text-xs text-muted font-data">
            {new Date(row.createdAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <div className="font-medium">{row.userId?.name ?? "—"}</div>
          <div className="text-xs text-muted">{row.userId?.email ?? "—"}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      className: "font-data text-center",
      render: (row) => row.items.reduce((sum, i) => sum + i.quantity, 0),
    },
    {
      key: "total",
      header: "Total",
      className: "font-data",
      render: (row) => formatMoney(row.pricing.grandTotal),
    },
    {
      key: "paymentMode",
      header: "Payment",
      render: (row) => (
        <span className="text-xs bg-bg border border-border px-2 py-1 rounded font-data uppercase">
          {row.paymentMode}
        </span>
      ),
    },
    {
      key: "orderStatus",
      header: "Status",
      render: (row) => <OrderStatusBadge status={row.orderStatus} />,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Orders</h1>
          <p className="text-sm text-muted mt-0.5">
            {data ? `${data.total} order${data.total === 1 ? "" : "s"}` : "Loading..."}
          </p>
        </div>

        {/* Pickup request button — shows count of ready shipments */}
        {processingCount > 0 && (
          <Button variant="secondary" onClick={() => setPickupOpen(true)}>
            <span className="flex items-center gap-2">
              <Truck size={16} />
              Request Pickup
              <span className="bg-secondary-foreground/20 text-secondary-foreground text-xs font-data px-1.5 py-0.5 rounded-full">
                {processingCount}
              </span>
            </span>
          </Button>
        )}
      </div>

      {/* Shipping rate calculator */}
      <ShippingRateCalculator />

      {/* Filters */}
      {/* Row 1: Search + Dates */}
      <div className="flex items-end gap-3 mb-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search order number..."
            defaultValue={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="font-data w-full pl-9 pr-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ from: e.target.value })}
            className="font-data px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">To</label>
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => setFilters({ to: e.target.value })}
            className="font-data px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {(filters.from || filters.to) && (
          <button
            onClick={() => setFilters({ from: "", to: "" })}
            className="self-end mb-0.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Row 2: Dropdowns */}
      <div className="flex items-end gap-3 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-muted">Status</label>
          <select
            value={filters.orderStatus}
            onChange={(e) => setFilters({ orderStatus: e.target.value })}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-muted">Payment mode</label>
          <select
            value={filters.paymentMode}
            onChange={(e) => setFilters({ paymentMode: e.target.value })}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All modes</option>
            <option value="online">Online</option>
            <option value="cod">COD</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-muted">Payment status</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ paymentStatus: e.target.value })}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.docs ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        onRowClick={(row) => navigate(`/orders/${row.orderNumber}`)}
        emptyMessage={
          <EmptyState icon={ShoppingBag} message="No orders yet" />
        }
      />

      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}

      <PickupRequestModal
        isOpen={pickupOpen}
        onClose={() => setPickupOpen(false)}
        readyCount={processingCount}
      />
    </div>
  );
}