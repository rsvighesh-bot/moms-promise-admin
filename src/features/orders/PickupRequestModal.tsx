import { useState } from "react";
import { Truck } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useCreatePickupRequest } from "./useShipping";

interface PickupRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    readyCount: number; // number of processing shipments
}

// Get today's date in YYYY-MM-DD format in IST
const getTodayIST = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

// Get tomorrow's date
const getTomorrowIST = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

const TIME_SLOTS = [
    { label: "10:00 AM", value: "10:00:00" },
    { label: "11:00 AM", value: "11:00:00" },
    { label: "12:00 PM", value: "12:00:00" },
    { label: "1:00 PM", value: "13:00:00" },
    { label: "2:00 PM", value: "14:00:00" },
    { label: "3:00 PM", value: "15:00:00" },
    { label: "4:00 PM", value: "16:00:00" },
    { label: "5:00 PM", value: "17:00:00" },
];

export function PickupRequestModal({
    isOpen, onClose, readyCount,
}: PickupRequestModalProps) {
    const mutation = useCreatePickupRequest();
    const [pickupDate, setPickupDate] = useState(getTodayIST());
    const [pickupTime, setPickupTime] = useState("14:00:00");
    const [packageCount, setPackageCount] = useState(readyCount);

    const handleSubmit = () => {
        mutation.mutate(
            {
                pickupDate,
                pickupTime,
                expectedPackageCount: packageCount,
            },
            {
                onSuccess: () => {
                    // Keep modal open to show success state
                },
            }
        );
    };

    const handleClose = () => {
        mutation.reset();
        onClose();
    };

    const backendError = (mutation.error as any)?.response?.data?.message as string | undefined;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Request Pickup">
            <div className="space-y-4">
                {/* Info banner */}
                <div className="flex items-start gap-3 bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm">
                    <Truck size={16} className="shrink-0 mt-0.5" />
                    <div>
                        One pickup request covers all packages at your warehouse for the day.
                        You don't need to raise separate requests per order.
                    </div>
                </div>

                {!mutation.isSuccess ? (
                    <>
                        {/* Package count */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">
                                Number of packages ready
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    value={packageCount}
                                    onChange={(e) => setPackageCount(Number(e.target.value))}
                                    className="font-data w-24 px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-sm text-muted">
                                    {readyCount} shipment{readyCount !== 1 ? "s" : ""} in processing
                                </span>
                            </div>
                            <p className="text-xs text-muted">
                                Count all packed boxes ready to hand over to the rider.
                            </p>
                        </div>

                        {/* Pickup date */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Pickup date</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPickupDate(getTodayIST())}
                                    className={`flex-1 py-2 rounded-md border text-sm transition-colors
                    ${pickupDate === getTodayIST()
                                            ? "border-primary bg-primary/10 text-primary font-medium"
                                            : "border-border bg-surface text-muted hover:bg-bg"
                                        }`}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPickupDate(getTomorrowIST())}
                                    className={`flex-1 py-2 rounded-md border text-sm transition-colors
                    ${pickupDate === getTomorrowIST()
                                            ? "border-primary bg-primary/10 text-primary font-medium"
                                            : "border-border bg-surface text-muted hover:bg-bg"
                                        }`}
                                >
                                    Tomorrow
                                </button>
                                <input
                                    type="date"
                                    value={pickupDate}
                                    min={getTodayIST()}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    className="font-data flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Pickup time */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Pickup time</label>
                            <div className="grid grid-cols-4 gap-2">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={slot.value}
                                        type="button"
                                        onClick={() => setPickupTime(slot.value)}
                                        className={`py-2 rounded-md border text-xs transition-colors
                      ${pickupTime === slot.value
                                                ? "border-primary bg-primary/10 text-primary font-medium"
                                                : "border-border bg-surface text-muted hover:bg-bg"
                                            }`}
                                    >
                                        {slot.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-surface border border-border rounded-lg px-4 py-3 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted">Warehouse</span>
                                <span className="font-medium">{"SEYON FASHION"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Date</span>
                                <span className="font-data">
                                    {new Date(pickupDate + "T00:00:00").toLocaleDateString("en-IN", {
                                        weekday: "short", day: "numeric", month: "short", year: "numeric"
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Time</span>
                                <span className="font-data">
                                    {TIME_SLOTS.find((s) => s.value === pickupTime)?.label ?? pickupTime}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Packages</span>
                                <span className="font-data">{packageCount}</span>
                            </div>
                        </div>

                        {backendError && (
                            <p className="text-sm text-red-500">{backendError}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="ghost" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                isLoading={mutation.isPending}
                                disabled={packageCount < 1}
                            >
                                <span className="flex items-center gap-2">
                                    <Truck size={15} /> Request Pickup
                                </span>
                            </Button>
                        </div>
                    </>
                ) : (
                    // Success state
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                            <Truck size={24} className="text-green-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-lg">Pickup Requested!</div>
                            <p className="text-sm text-muted mt-1">
                                Delhivery will collect{" "}
                                <span className="font-data font-medium text-foreground">
                                    {packageCount} package{packageCount !== 1 ? "s" : ""}
                                </span>{" "}
                                on{" "}
                                <span className="font-medium text-foreground">
                                    {new Date(pickupDate + "T00:00:00").toLocaleDateString("en-IN", {
                                        weekday: "short", day: "numeric", month: "short"
                                    })}
                                </span>{" "}
                                at{" "}
                                <span className="font-medium text-foreground">
                                    {TIME_SLOTS.find((s) => s.value === pickupTime)?.label}
                                </span>.
                            </p>
                            <p className="text-xs text-muted mt-2">
                                Make sure all labels are printed and boxes are ready near the door.
                            </p>
                        </div>
                        <Button onClick={handleClose} className="w-full">Done</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}