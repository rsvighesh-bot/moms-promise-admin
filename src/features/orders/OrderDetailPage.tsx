import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, MapPin, Package,
  Clock, CreditCard, Printer, Truck, Gift,
} from "lucide-react";
import { useOrder } from "./useOrders";
import { useShipment } from "./useShipping";
import { fetchShippingLabel } from "./shippingApi";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";
import { ShipmentPanel } from "./ShipmentPanel";
import { OrderActions } from "./OrderActions";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { useState } from "react";
import { PaymentLinkPanel } from "./PaymentLinkPanel";
import { type OrderItem } from "./orderApi";

type OrderItemRow =
  | { type: "item"; item: OrderItem }
  | { type: "combo"; groupId: string; comboName: string; items: OrderItem[] };

// Combo items share a comboGroupId — group them so the admin sees "this
// was one combo", not three unrelated-looking lines.
function groupOrderItems(items: OrderItem[]): OrderItemRow[] {
  const rows: OrderItemRow[] = [];
  const seenGroups = new Set<string>();

  for (const item of items) {
    if (item.comboGroupId) {
      if (seenGroups.has(item.comboGroupId)) continue;
      seenGroups.add(item.comboGroupId);
      rows.push({
        type: "combo",
        groupId: item.comboGroupId,
        comboName: item.comboName || "Combo",
        items: items.filter((i) => i.comboGroupId === item.comboGroupId),
      });
    } else {
      rows.push({ type: "item", item });
    }
  }

  return rows;
}

export function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useOrder(orderNumber ?? "");

  const order = data?.order;
  const payment = data?.payment;

  // Shares cache with ShipmentPanel's useShipment(order._id) — no duplicate fetch
  const { data: shipment } = useShipment(order?._id ?? "");

  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState("");

  const handlePrintLabel = async () => {
    if (!shipment) return;
    setLabelLoading(true);
    setLabelError("");
    try {
      const result = await fetchShippingLabel(shipment.awbNumber, "A4");
      window.open(result.labelUrl, "_blank");
    } catch (err: any) {
      setLabelError(err?.response?.data?.message ?? "Failed to fetch label. Try again.");
    } finally {
      setLabelLoading(false);
    }
  };

  const scrollToShipment = () => {
    document.getElementById("shipment-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-muted">Order not found.</p>
        <Button variant="ghost" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const canCreateShipment = ["confirmed", "processing"].includes(order.orderStatus) && !shipment;

  return (
    <div className=" mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} /> Back to Orders
      </button>

      {/* Header card */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <p className="text-sm text-muted font-data mt-1">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors disabled:opacity-50 px-1"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button> */}

            {shipment ? (
              <>
                <Button variant="ghost" onClick={handlePrintLabel} isLoading={labelLoading}>
                  <span className="flex items-center gap-1.5">
                    <Printer size={14} /> Print Label
                  </span>
                </Button>
              </>
            ) : canCreateShipment ? (
              <Button variant="secondary" onClick={scrollToShipment}>
                <span className="flex items-center gap-1.5">
                  <Truck size={14} /> Generate Shipment
                </span>
              </Button>
            ) : null}
          </div>
        </div>
        {labelError && <p className="text-xs text-red-500 mt-2">{labelError}</p>}
      </div>

      {/* Status badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-1.5">
          <span className="text-xs text-muted">Order status</span>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-1.5">
          <span className="text-xs text-muted">Payment mode</span>
          <span className="inline-flex items-center w-fit text-xs bg-bg border border-border px-2.5 py-1 rounded-full font-data uppercase tracking-wide">
            {order.paymentMode}
          </span>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-1.5">
          <span className="text-xs text-muted">Payment status</span>
          <span className={`inline-flex items-center w-fit text-xs px-2.5 py-1 rounded-full font-data font-medium
            ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700"
              : order.paymentStatus === "failed" ? "bg-red-100 text-red-600"
                : order.paymentStatus === "refunded" ? "bg-purple-100 text-purple-700"
                  : "bg-yellow-100 text-yellow-700"}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 font-semibold mb-4">
              <Package size={16} /> Items
            </div>
            <div className="space-y-4">
              {groupOrderItems(order.items).map((row) =>
                row.type === "combo" ? (
                  <div
                    key={row.groupId}
                    className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3"
                  >
                    <div className="flex items-center gap-1.5 text-primary">
                      <Gift size={14} className="shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        Combo: {row.comboName}
                      </span>
                    </div>
                    {row.items.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover ring-1 ring-border shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-surface ring-1 ring-border flex items-center justify-center shrink-0">
                            <Package size={18} className="text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted font-data mt-0.5">
                            {item.sku} · {item.age} yrs{item.color ? ` · ${item.color}` : ""}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-sm font-data text-muted">
                              {formatMoney(item.unitPrice)} × {item.quantity}
                            </div>
                            <div className="text-sm font-data font-semibold">
                              {formatMoney(item.lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div key={row.item.variantId} className="flex gap-4">
                    {row.item.image ? (
                      <img src={row.item.image} alt="" className="w-16 h-16 rounded-lg object-cover ring-1 ring-border shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-bg ring-1 ring-border flex items-center justify-center shrink-0">
                        <Package size={18} className="text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{row.item.name}</div>
                      <div className="text-xs text-muted font-data mt-0.5">
                        {row.item.sku} · {row.item.age} yrs{row.item.color ? ` · ${row.item.color}` : ""}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-data text-muted">
                          {formatMoney(row.item.unitPrice)} × {row.item.quantity}
                        </div>
                        <div className="text-sm font-data font-semibold">
                          {formatMoney(row.item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-2 font-data text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatMoney(order.pricing.subtotal)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>−{formatMoney(order.pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{order.pricing.shippingFee === 0 ? "Free" : formatMoney(order.pricing.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatMoney(order.pricing.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Shipping — anchor target for "Generate Shipment" */}
          <div id="shipment-panel">
            <ShipmentPanel order={order} />
          </div>

          {/* Status history */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 font-semibold mb-4">
              <Clock size={16} /> Status history
            </div>
            <div className="space-y-3">
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {h.status.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-muted font-data">
                      {new Date(h.timestamp).toLocaleString("en-IN")}
                    </div>
                    {h.note && <div className="text-xs text-muted mt-0.5">{h.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <User size={16} /> Customer
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-medium">{order.userId?.name ?? "—"}</div>
              <div className="text-muted">{order.userId?.email ?? "—"}</div>
              {order.userId?.phone && (
                <div className="text-muted font-data">{order.userId.phone}</div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <MapPin size={16} /> Delivery address
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-medium">{order.addressSnapshot.fullName}</div>
              <div className="text-muted">{order.addressSnapshot.phone}</div>
              <div className="text-muted mt-1">{order.addressSnapshot.line1}
                {order.addressSnapshot.line2 ? `, ${order.addressSnapshot.line2}` : ""}
              </div>
              <div className="text-muted">{order.addressSnapshot.city}, {order.addressSnapshot.state}</div>
              <div className="text-muted font-data">{order.addressSnapshot.pincode}</div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <CreditCard size={16} /> Payment
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Mode</span>
                <span className="font-data uppercase">{order.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className={`font-data font-medium
                  ${order.paymentStatus === "paid" ? "text-green-600"
                    : order.paymentStatus === "failed" ? "text-red-500"
                      : order.paymentStatus === "refunded" ? "text-purple-600"
                        : "text-yellow-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {payment?.method && (
                <div className="flex justify-between">
                  <span className="text-muted">Method</span>
                  <span className="font-data capitalize">{payment.method}</span>
                </div>
              )}
              {payment?.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted">Razorpay ID</span>
                  <span className="font-data text-xs truncate max-w-32" title={payment.razorpayPaymentId}>
                    {payment.razorpayPaymentId}
                  </span>
                </div>
              )}
              {payment?.refundId && (
                <div className="flex justify-between">
                  <span className="text-muted">Refund ID</span>
                  <span className="font-data text-xs truncate max-w-32" title={payment.refundId}>
                    {payment.refundId}
                  </span>
                </div>
              )}
              {payment?.refundAmount && (
                <div className="flex justify-between">
                  <span className="text-muted">Refunded</span>
                  <span className="font-data text-purple-600 font-medium">
                    {formatMoney(payment.refundAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span className="font-data">{formatMoney(order.pricing.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Link */}
          <PaymentLinkPanel
            order={order}
            existingLinkUrl={(order as any).paymentLinkUrl}
            onSuccess={() => refetch()}
          />

          {/* Actions */}
          <OrderActions order={order} onSuccess={() => refetch()} />
        </div>
      </div>
    </div>
  );
}