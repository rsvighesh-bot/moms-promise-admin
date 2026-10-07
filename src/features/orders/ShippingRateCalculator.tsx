import { useState } from "react";
import { Calculator, ChevronDown, Truck, Search } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";

interface RateBreakdown {
  baseDeliveryCharge: number;
  handlingCharge: number;
  lastMileCharge: number;
  peakSurcharge: number;
  codCharge: number;
  grossAmount: number;
  sgst: number;
  cgst: number;
  igst: number;
  totalTax: number;
}

interface ShippingRate {
  mode: string;
  zone: string;
  breakdown: RateBreakdown;
  totalAmount: number;
  chargedWeight: number;
}

interface ServiceabilityResult {
  isServiceable: boolean;
  isCodAvailable: boolean;
  transitDays?: number;
  message: string;
}

const toRupees = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export function ShippingRateCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [paymentMode, setPaymentMode] = useState<"online" | "cod">("online");
  const [codAmount, setCodAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceability, setServiceability] =
    useState<ServiceabilityResult | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [weight, setWeight] = useState("");

  const handleCheck = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setError("");
    setServiceability(null);
    setRates([]);
    setIsLoading(true);

    try {
      const [serviceRes, rateRes] = await Promise.all([
        api.get(`/shipping/serviceability?pincode=${pincode}`),
        api.get("/shipping/rate", {
          params: {
            pincode,
            paymentMode,
            codAmount: codAmount || 0,
            ...(weight && Number(weight) > 0 ? { weight: Number(weight) } : {}),
          },
        }),
      ]);
      setServiceability(serviceRes.data);
      setRates(rateRes.data.rates ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to fetch rates. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add to handleReset:
  const handleReset = () => {
    setPincode("");
    setCodAmount("");
    setWeight(""); // new
    setPaymentMode("online");
    setServiceability(null);
    setRates([]);
    setError("");
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-4">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-bg transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-primary" />
          <span className="text-sm font-medium">Shipping Rate Calculator</span>
          {serviceability && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ml-1
              ${serviceability.isServiceable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
            >
              {pincode} —{" "}
              {serviceability.isServiceable ? "Serviceable" : "Not serviceable"}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t border-border p-4 bg-bg space-y-4">
          {/* Inputs row */}
          <div className="flex items-end gap-3 flex-wrap">
            {/* Pincode — unchanged */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Pincode</label>
              <input
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="600001"
                maxLength={6}
                className="font-data w-28 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Payment mode — unchanged */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Payment mode</label>
              <select
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value as "online" | "cod");
                  setCodAmount("");
                }}
                className="font-data px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="online">Online / Prepaid</option>
                <option value="cod">COD</option>
              </select>
            </div>

            {/* Weight — new */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">
                Weight (g)
                <span className="text-muted font-normal ml-1">optional</span>
              </label>
              <input
                type="number"
                value={weight}
                min={1}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`defaul 300}g`}
                className="font-data w-28 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* COD amount — only shown when COD selected, unchanged */}
            {paymentMode === "cod" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">COD amount (₹)</label>
                <input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  placeholder="549"
                  step="0.01"
                  className="font-data w-28 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <Button
              onClick={handleCheck}
              isLoading={isLoading}
              disabled={pincode.length !== 6}
            >
              <span className="flex items-center gap-2">
                <Search size={14} /> Check
              </span>
            </Button>

            {(serviceability || rates.length > 0) && (
              <button
                onClick={handleReset}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Serviceability badge */}
          {serviceability && (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
              ${
                serviceability.isServiceable
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              <span className="font-bold">
                {serviceability.isServiceable ? "✓" : "✗"}
              </span>
              <span>{serviceability.message}</span>
              {serviceability.isServiceable && (
                <div className="flex items-center gap-3 ml-auto text-xs">
                  <span>
                    COD:{" "}
                    {serviceability.isCodAvailable
                      ? "✓ Available"
                      : "✗ Not available"}
                  </span>
                  {serviceability.transitDays && (
                    <span>
                      ETA: {serviceability.transitDays} day
                      {serviceability.transitDays !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rate cards — horizontal layout to save vertical space */}
          {rates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rates.map((rate) => (
                <div
                  key={rate.mode}
                  className="bg-surface border border-border rounded-lg overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-bg border-b border-border">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-primary" />
                      <span className="text-sm font-semibold">{rate.mode}</span>
                      <span className="text-xs text-muted">
                        Zone {rate.zone}
                      </span>
                    </div>
                    <span className="font-data font-bold text-primary">
                      {toRupees(rate.totalAmount)}
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="px-4 py-3 space-y-1 font-data text-xs">
                    {[
                      ["Base delivery", rate.breakdown.baseDeliveryCharge],
                      ["Handling", rate.breakdown.handlingCharge],
                      ["Last mile", rate.breakdown.lastMileCharge],
                      ["Peak surcharge", rate.breakdown.peakSurcharge],
                      ["COD charge", rate.breakdown.codCharge],
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
                      <span>{toRupees(rate.breakdown.grossAmount)}</span>
                    </div>

                    {/* Tax */}
                    {rate.breakdown.totalTax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">
                          Tax
                          {rate.breakdown.sgst > 0 &&
                            ` (SGST ${toRupees(rate.breakdown.sgst)}`}
                          {rate.breakdown.cgst > 0 &&
                            ` + CGST ${toRupees(rate.breakdown.cgst)}`}
                          {rate.breakdown.igst > 0 &&
                            ` IGST ${toRupees(rate.breakdown.igst)}`}
                          {rate.breakdown.totalTax > 0 && ")"}
                        </span>
                        <span>{toRupees(rate.breakdown.totalTax)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-semibold pt-1 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">
                        {toRupees(rate.totalAmount)}
                      </span>
                    </div>

                    <div className="text-muted pt-0.5">
                      Charged weight: {rate.chargedWeight}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No rates returned but serviceability passed */}
          {serviceability?.isServiceable &&
            rates.length === 0 &&
            !isLoading && (
              <p className="text-sm text-muted">
                No rate data returned for this combination.
              </p>
            )}
        </div>
      )}
    </div>
  );
}
