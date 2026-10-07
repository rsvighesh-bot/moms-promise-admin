import { useState } from "react";
import {
  Package,
  RefreshCw,
  Truck,
  RotateCcw,
  MapPin,
  Clock,
  Calculator,
  ChevronDown,
  Printer
} from "lucide-react";
import {
  useShipment,
  useCreateShipment,
  useSyncShipment,
  useCreateReturn,
  useOrderShippingRate,
} from "./useShipping";
import { type Order } from "./orderApi";
import { Button } from "../../components/ui/Button";

import { fetchShippingLabel } from "./shippingApi";

const SHIPMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  picked_up: "bg-indigo-100 text-indigo-700",
  in_transit: "bg-yellow-100 text-yellow-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-gray-100 text-gray-600",
  rto: "bg-red-100 text-red-600",
  cancelled: "bg-gray-200 text-gray-500",
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  returned: "Returned",
  rto: "Return to Origin",
  cancelled: "Cancelled",
};

const toRupees = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

interface ShipmentPanelProps {
  order: Order;
}

export function ShipmentPanel({ order }: ShipmentPanelProps) {
  const { data: shipment, isLoading } = useShipment(order._id);
  const createMutation = useCreateShipment(order._id);
  const syncMutation = useSyncShipment(order._id);
  const returnMutation = useCreateReturn(order._id);

  const [weightInput, setWeightInput] = useState("");
  const [weightError, setWeightError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const [labelSize, setLabelSize] = useState<"A4" | "4R">("A4");
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState("");

  // Only fetch rate when user has typed a valid weight
  const parsedWeight = Number(weightInput);
  const weightValid = parsedWeight > 0;
  const { data: rateData, isFetching: rateFetching } = useOrderShippingRate(
    order.orderNumber,
    weightValid ? parsedWeight : 0,
  );

  const canCreateShipment =
    ["confirmed", "processing"].includes(order.orderStatus) && !shipment;
  const canCreateReturn =
    order.orderStatus === "returned" && shipment?.type !== "reverse";

  const handleCreate = () => {
    if (!weightValid) {
      setWeightError("Enter the packed weight in grams");
      return;
    }
    setWeightError("");
    createMutation.mutate(
      { orderNumber: order.orderNumber, weight: parsedWeight },
      {
        onSuccess: () => {
          setWeightInput("");
          setConfirming(false);
        },
      },
    );
  };


  console.log(shipment, "kl")

  const handlePrintLabel = async () => {
    if (!shipment) return;
    setLabelLoading(true);
    setLabelError("");
    try {
      const result = await fetchShippingLabel(shipment.awbNumber, labelSize);
      window.open(result.labelUrl, "_blank");
    } catch (err: any) {
      setLabelError(
        err?.response?.data?.message ?? "Failed to fetch label. Try again."
      );
    } finally {
      setLabelLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-3">
          <Truck size={15} /> Shipping
        </div>
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Truck size={15} /> Shipping
        </div>
        {shipment && (
          <button
            onClick={() => syncMutation.mutate(shipment.awbNumber)}
            disabled={syncMutation.isPending}
            title="Sync latest status from Delhivery"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={syncMutation.isPending ? "animate-spin" : ""}
            />
            Sync
          </button>
        )}
      </div>

      {/* ── No shipment yet ─────────────────────────────────────── */}
      {!shipment && (
        <div className="space-y-3">
          <p className="text-sm text-muted">No shipment created yet.</p>

          {canCreateShipment && (
            <>
              {/* Weight input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">
                  Packed weight (grams)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weightInput}
                    min={1}
                    placeholder="e.g. 450"
                    onChange={(e) => {
                      setWeightInput(e.target.value);
                      setWeightError("");
                      setConfirming(false);
                    }}
                    className="font-data w-32 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs text-muted">g</span>
                  {rateFetching && (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calculator size={11} className="animate-pulse" />{" "}
                      Calculating...
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  Weigh the packed box first.
                </p>
                {weightError && (
                  <p className="text-xs text-red-500">{weightError}</p>
                )}
              </div>

              {/* Rate preview — shows as soon as weight is valid */}
              {rateData && weightValid && !rateFetching && (
                <div className="rounded-lg border border-border overflow-hidden">
                  {/* Rate header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
                    <div className="text-xs font-medium flex items-center gap-1.5">
                      <Calculator size={12} className="text-primary" />
                      Estimated shipping cost
                    </div>
                    <div className="text-sm font-bold font-data text-primary">
                      {rateData.shippingCost.totalAmountFormatted}
                    </div>
                  </div>

                  {/* Rate details */}
                  <div className="px-3 py-2.5 space-y-1 font-data text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Pincode</span>
                      <span className="text-foreground">
                        {rateData.destinationPincode} · Zone {rateData.zone}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Payment mode</span>
                      <span className="text-foreground uppercase">
                        {rateData.paymentMode}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Weight</span>
                      <span className="text-foreground">{rateData.weight}</span>
                    </div>

                    {/* Breakdown toggle */}
                    <details className="pt-1">
                      <summary className="text-muted cursor-pointer flex items-center gap-1 list-none">
                        <ChevronDown size={11} /> View breakdown
                      </summary>
                      <div className="mt-2 space-y-1 border-t border-border pt-2">
                        {[
                          [
                            "Base delivery",
                            rateData.shippingCost.breakdown.baseDeliveryCharge,
                          ],
                          [
                            "Handling",
                            rateData.shippingCost.breakdown.handlingCharge,
                          ],
                          [
                            "Last mile",
                            rateData.shippingCost.breakdown.lastMileCharge,
                          ],
                          [
                            "Peak surcharge",
                            rateData.shippingCost.breakdown.peakSurcharge,
                          ],
                          [
                            "COD charge",
                            rateData.shippingCost.breakdown.codCharge,
                          ],
                        ]
                          .filter(([, v]) => (v as number) > 0)
                          .map(([label, value]) => (
                            <div
                              key={label as string}
                              className="flex justify-between"
                            >
                              <span className="text-muted">{label}</span>
                              <span>{toRupees(value as number)}</span>
                            </div>
                          ))}
                        <div className="flex justify-between pt-1 border-t border-border">
                          <span className="text-muted">Gross</span>
                          <span>
                            {toRupees(
                              rateData.shippingCost.breakdown.grossAmount,
                            )}
                          </span>
                        </div>
                        {rateData.shippingCost.breakdown.totalTax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted">Tax</span>
                            <span>
                              {toRupees(
                                rateData.shippingCost.breakdown.totalTax,
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-1 border-t border-border">
                          <span>Total</span>
                          <span className="text-primary">
                            {rateData.shippingCost.totalAmountFormatted}
                          </span>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {/* Confirm step */}
              {!confirming ? (
                <Button
                  variant="secondary"
                  disabled={!weightValid || rateFetching}
                  onClick={() => {
                    if (!weightValid) {
                      setWeightError("Enter the packed weight in grams");
                      return;
                    }
                    setConfirming(true);
                  }}
                  className="w-full"
                >
                  <span className="flex items-center gap-2">
                    <Package size={15} />
                    {rateData
                      ? `Create Shipment · ${rateData.shippingCost.totalAmountFormatted}`
                      : "Create Delhivery Shipment"}
                  </span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted text-center">
                    Shipping cost:{" "}
                    <span className="font-semibold text-foreground font-data">
                      {rateData?.shippingCost.totalAmountFormatted}
                    </span>{" "}
                    · Weight: <span className="font-data">{parsedWeight}g</span>{" "}
                    · Confirm to create AWB on Delhivery.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setConfirming(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCreate}
                      isLoading={createMutation.isPending}
                      className="flex-1"
                    >
                      Confirm & Create
                    </Button>
                  </div>
                </div>
              )}

              {createMutation.isError && (
                <p className="text-xs text-red-500">
                  {(createMutation.error as any)?.response?.data?.message ??
                    "Shipment creation failed"}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Shipment exists ─────────────────────────────────────── */}
      {shipment && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs text-muted mb-0.5">AWB Number</div>
              <div className="font-data font-semibold text-sm">
                {shipment.awbNumber}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium
                ${shipment.type === "reverse" ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"}`}
              >
                {shipment.type === "reverse" ? "Return" : "Forward"}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium
                ${SHIPMENT_STATUS_STYLES[shipment.status] ?? "bg-gray-100 text-gray-600"}`}
              >
                {SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status}
              </span>
            </div>
          </div>

          {/* Print label */}
          <div className="flex flex-col gap-2 pt-1 pb-1 border-y border-border">
            <div className="flex items-center gap-2">
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as "A4" | "4R")}
                className="font-data flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="A4">A4 — standard printer</option>
                <option value="4R">4R — thermal label printer</option>
              </select>
              <Button
                onClick={handlePrintLabel}
                isLoading={labelLoading}
                variant="ghost"
                className="shrink-0"
              >
                <span className="flex items-center gap-1.5">
                  <Printer size={14} /> Print Label
                </span>
              </Button>
            </div>
            {labelError && <p className="text-xs text-red-500">{labelError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-data">
            <div>
              <span className="text-muted">Weight: </span>
              {shipment.weight}g
            </div>
            {shipment.deliveredAt && (
              <div>
                <span className="text-muted">Delivered: </span>
                {new Date(shipment.deliveredAt).toLocaleDateString("en-IN")}
              </div>
            )}
            {shipment.codAmount && (
              <div>
                <span className="text-muted">COD: </span>₹
                {(shipment.codAmount / 100).toLocaleString("en-IN")}
              </div>
            )}
          </div>

          {/* Tracking timeline */}
          {shipment.statusHistory.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
                <Clock size={12} /> Tracking history
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...shipment.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium">
                        {SHIPMENT_STATUS_LABELS[h.status] ?? h.status}
                        <span className="text-muted font-normal ml-1">
                          — {h.rawStatus}
                        </span>
                      </div>
                      {h.location && (
                        <div className="text-xs text-muted flex items-center gap-1">
                          <MapPin size={10} /> {h.location}
                        </div>
                      )}
                      <div className="text-xs text-muted font-data">
                        {new Date(h.timestamp).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {syncMutation.isSuccess && (
            <p className="text-xs text-green-600">
              Status synced from Delhivery.
            </p>
          )}

          {/* Return pickup */}
          {canCreateReturn && (
            <div className="pt-1 border-t border-border">
              <Button
                variant="ghost"
                isLoading={returnMutation.isPending}
                onClick={() => returnMutation.mutate(order.orderNumber)}
                className="w-full"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw size={15} /> Schedule Return Pickup
                </span>
              </Button>
              {returnMutation.isError && (
                <p className="text-xs text-red-500 mt-1">
                  {(returnMutation.error as any)?.response?.data?.message ??
                    "Return creation failed"}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
