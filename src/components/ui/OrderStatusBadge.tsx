import { type OrderStatus } from "../../features/orders/orderApi";

const styles: Record<OrderStatus, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  packed: "bg-cyan-100 text-cyan-700",          // new
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-yellow-100 text-yellow-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  return_requested: "bg-amber-100 text-amber-700",  // new
  return_approved: "bg-teal-100 text-teal-700",     // new
  return_rejected: "bg-red-100 text-red-600",       // new
  returned: "bg-gray-100 text-gray-600",
  refunded: "bg-purple-100 text-purple-700",        // new
  rto: "bg-gray-200 text-gray-700",
};

const labels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  return_rejected: "Return Rejected",
  returned: "Returned",
  refunded: "Refunded",
  rto: "RTO",
};
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center w-fit text-xs bg-bg border border-border px-2.5 py-1 rounded-full font-data uppercase tracking-wides ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
