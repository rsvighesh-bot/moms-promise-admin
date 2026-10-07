import { useState } from "react";
import {
    Package, CheckCircle, XCircle, RotateCcw,
    RefreshCw, DollarSign,
} from "lucide-react";
import { type Order } from "./orderApi";
import {
    usePackOrder, useApproveReturn, useRejectReturn,
    useMarkReturned, useMarkRefunded, useUpdateOrderStatus,
} from "./useOrders";
import { type OrderStatus } from "./orderApi";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";

const ALL_STATUSES: OrderStatus[] = [
    "placed", "confirmed", "packed", "processing", "shipped",
    "out_for_delivery", "delivered", "cancelled",
    "return_requested", "return_approved", "return_rejected",
    "returned", "refunded", "rto",
];

interface OrderActionsProps {
    order: Order;
    onSuccess: () => void;
}

export function OrderActions({ order, onSuccess }: OrderActionsProps) {
    const packMutation = usePackOrder();
    const approveReturnMutation = useApproveReturn();
    const rejectReturnMutation = useRejectReturn();
    const markReturnedMutation = useMarkReturned();
    const markRefundedMutation = useMarkRefunded();
    const updateMutation = useUpdateOrderStatus();

    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectOpen, setRejectOpen] = useState(false);
    const [note, setNote] = useState("");
    const [manualStatus, setManualStatus] = useState<OrderStatus | "">("");

    const mutationError = (m: any) =>
        m.error?.response?.data?.message as string | undefined;



    return (
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
                <p className="font-semibold">Actions</p>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted">Current status</span>
                    <OrderStatusBadge status={order.orderStatus} />
                </div>
            </div>

            {/* CONFIRMED → PACKED */}
            {order.orderStatus === "confirmed" && (
                <div className="space-y-2">
                    <p className="text-xs text-muted">Mark this order as packed and ready for shipment.</p>
                    <input
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="font-data w-full px-3 py-2 rounded-md border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                        className="w-full"
                        isLoading={packMutation.isPending}
                        onClick={() =>
                            packMutation.mutate(
                                { orderNumber: order.orderNumber, note },
                                { onSuccess: () => { setNote(""); onSuccess(); } }
                            )
                        }
                    >
                        <span className="flex items-center gap-2">
                            <Package size={15} /> Mark as Packed
                        </span>
                    </Button>
                    {mutationError(packMutation) && (
                        <p className="text-xs text-red-500">{mutationError(packMutation)}</p>
                    )}
                </div>
            )}

            {/* RETURN_REQUESTED → approve or reject */}
            {order.orderStatus === "return_requested" && (
                <div className="space-y-2">
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-800">
                        <RotateCcw size={15} className="shrink-0 mt-0.5" />
                        <div>
                            <div className="font-medium">Return requested by customer</div>
                            {(order as any).returnReason && (
                                <div className="text-xs mt-0.5">Reason: {(order as any).returnReason}</div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="primary"
                            isLoading={approveReturnMutation.isPending}
                            onClick={() =>
                                approveReturnMutation.mutate(
                                    { orderNumber: order.orderNumber },
                                    { onSuccess }
                                )
                            }
                        >
                            <span className="flex items-center gap-2">
                                <CheckCircle size={14} /> Approve
                            </span>
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setRejectOpen(true)}
                        >
                            <span className="flex items-center gap-2">
                                <XCircle size={14} /> Reject
                            </span>
                        </Button>
                    </div>
                    {mutationError(approveReturnMutation) && (
                        <p className="text-xs text-red-500">{mutationError(approveReturnMutation)}</p>
                    )}
                </div>
            )}

            {/* RETURN_APPROVED → mark returned */}
            {order.orderStatus === "return_approved" && (
                <div className="space-y-2">
                    <p className="text-xs text-muted">
                        Once the item arrives back at your warehouse, mark it as returned.
                    </p>
                    <input
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="font-data w-full px-3 py-2 rounded-md border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                        className="w-full"
                        isLoading={markReturnedMutation.isPending}
                        onClick={() =>
                            markReturnedMutation.mutate(
                                { orderNumber: order.orderNumber, note },
                                { onSuccess: () => { setNote(""); onSuccess(); } }
                            )
                        }
                    >
                        <span className="flex items-center gap-2">
                            <RotateCcw size={15} /> Mark as Returned
                        </span>
                    </Button>
                    {mutationError(markReturnedMutation) && (
                        <p className="text-xs text-red-500">{mutationError(markReturnedMutation)}</p>
                    )}
                </div>
            )}

            {/* RETURNED → mark refunded */}
            {order.orderStatus === "returned" && (
                <div className="space-y-2">
                    <p className="text-xs text-muted">
                        Once you've processed the refund manually (via Razorpay or bank transfer), mark it here.
                    </p>
                    <input
                        placeholder="Note e.g. Refunded via Razorpay dashboard"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="font-data w-full px-3 py-2 rounded-md border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                        className="w-full"
                        isLoading={markRefundedMutation.isPending}
                        onClick={() =>
                            markRefundedMutation.mutate(
                                { orderNumber: order.orderNumber, note },
                                { onSuccess: () => { setNote(""); onSuccess(); } }
                            )
                        }
                    >
                        <span className="flex items-center gap-2">
                            <DollarSign size={15} /> Mark as Refunded
                        </span>
                    </Button>
                    {mutationError(markRefundedMutation) && (
                        <p className="text-xs text-red-500">{mutationError(markRefundedMutation)}</p>
                    )}
                </div>
            )}

            {/* RETURN_REJECTED — show rejection reason */}
            {order.orderStatus === "return_rejected" && (order as any).returnRejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                    <div className="font-medium">Return rejected</div>
                    <div className="text-xs mt-0.5">Reason: {(order as any).returnRejectionReason}</div>
                </div>
            )}

            {/* Divider before manual override */}
            <div className="border-t border-border pt-4">
                <p className="text-xs text-muted mb-2 font-medium">Manual status override</p>
                <div className="space-y-2">
                    <select
                        value={manualStatus}
                        onChange={(e) => setManualStatus(e.target.value as OrderStatus)}
                        className="font-data w-full px-3 py-2.5 rounded-md border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select status...</option>
                        {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <input
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="font-data w-full px-3 py-2 rounded-md border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                        variant="ghost"
                        className="w-full"
                        disabled={!manualStatus}
                        isLoading={updateMutation.isPending}
                        onClick={() =>
                            updateMutation.mutate(
                                { orderNumber: order.orderNumber, status: manualStatus as OrderStatus, note },
                                { onSuccess: () => { setManualStatus(""); setNote(""); onSuccess(); } }
                            )
                        }
                    >
                        <span className="flex items-center gap-2">
                            <RefreshCw size={14} /> Update Status
                        </span>
                    </Button>
                    {mutationError(updateMutation) && (
                        <p className="text-xs text-red-500">{mutationError(updateMutation)}</p>
                    )}
                </div>
            </div>

            {/* Reject return dialog */}
            <ConfirmDialog
                isOpen={rejectOpen}
                onClose={() => { setRejectOpen(false); setRejectionReason(""); }}
                onConfirm={() =>
                    rejectReturnMutation.mutate(
                        { orderNumber: order.orderNumber, reason: rejectionReason },
                        {
                            onSuccess: () => {
                                setRejectOpen(false);
                                setRejectionReason("");
                                onSuccess();
                            },
                        }
                    )
                }
                title="Reject return request?"
                message=""
                isLoading={rejectReturnMutation.isPending}
                variant="danger"
            >
                <div className="mb-4">
                    <label className="text-sm font-medium block mb-1.5">
                        Rejection reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        placeholder="e.g. Return window has expired / Item is not eligible for return"
                        className="font-data w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </div>
            </ConfirmDialog>
        </div>
    );
}