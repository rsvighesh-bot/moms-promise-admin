import { useState } from "react";
import { Link2, Copy, Check, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { useCreatePaymentLink } from "./usePaymentLink";
import { checkPaymentLinkStatus } from "./paymentLinkApi";
import { type Order } from "./orderApi";
import { Button } from "../../components/ui/Button";

interface PaymentLinkPanelProps {
    order: Order;
    existingLinkUrl?: string;
    onSuccess: () => void;
}

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
    created: { label: "Not paid yet", color: "text-yellow-600" },
    partially_paid: { label: "Partially paid", color: "text-orange-600" },
    paid: { label: "Paid", color: "text-green-600" },
    cancelled: { label: "Cancelled", color: "text-red-500" },
    expired: { label: "Expired", color: "text-red-500" },
};

export function PaymentLinkPanel({ order, existingLinkUrl, onSuccess }: PaymentLinkPanelProps) {
    const mutation = useCreatePaymentLink();
    const [copied, setCopied] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<{
        url: string;
        amountFormatted: string;
        expiresAt: string;
    } | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [linkStatus, setLinkStatus] = useState<{
        status: string;
        isPaid: boolean;
        expiresAt: string | null;
    } | null>(null);

    const activeUrl = generatedLink?.url ?? existingLinkUrl;

    const canGenerate =
        order.paymentStatus !== "paid" &&
        order.paymentStatus !== "refunded" &&
        !["cancelled", "refunded"].includes(order.orderStatus);

    if (!canGenerate && !activeUrl) return null;

    const handleCopy = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerate = () => {
        mutation.mutate(order._id, {
            onSuccess: (data) => {
                setGeneratedLink({
                    url: data.paymentLinkUrl,
                    amountFormatted: data.amountFormatted,
                    expiresAt: data.expiresAt,
                });
                setLinkStatus(null);
                onSuccess();
            },
        });
    };

    const handleCheckStatus = async () => {
        setCheckingStatus(true);
        try {
            const result = await checkPaymentLinkStatus(order._id);
            setLinkStatus({
                status: result.status,
                isPaid: result.isPaid,
                expiresAt: result.expiresAt,
            });
            if (result.isPaid) onSuccess(); // refetch order to show confirmed status
        } catch (err: any) {
            setLinkStatus({ status: "error", isPaid: false, expiresAt: null });
        } finally {
            setCheckingStatus(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold">
                <Link2 size={16} className="text-primary" /> Payment Link
            </div>

            {activeUrl ? (
                <div className="space-y-3">
                    {/* Generated confirmation */}
                    {generatedLink && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                            Link generated — {generatedLink.amountFormatted} · expires{" "}
                            {new Date(generatedLink.expiresAt).toLocaleString("en-IN")}
                        </div>
                    )}

                    {/* Link display */}
                    <div className="flex items-center gap-2 bg-bg border border-border rounded-md px-3 py-2">
                        <span className="font-data text-xs text-muted flex-1 truncate">{activeUrl}</span>
                        <button
                            onClick={() => handleCopy(activeUrl)}
                            title="Copy link"
                            className="flex items-center gap-1 text-xs text-primary hover:opacity-80 shrink-0"
                        >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <a
                            href={activeUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Open link"
                            className="text-muted hover:text-primary shrink-0"
                        >
                            <ExternalLink size={13} />
                        </a>
                    </div>

                    {/* Payment status check */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            {linkStatus && (
                                <div className="flex items-center gap-1.5 text-sm">
                                    {linkStatus.status === "error" ? (
                                        <span className="flex items-center gap-1 text-red-500">
                                            <AlertCircle size={13} /> Check failed
                                        </span>
                                    ) : (
                                        <span className={`font-medium ${STATUS_DISPLAY[linkStatus.status]?.color ?? "text-muted"}`}>
                                            {STATUS_DISPLAY[linkStatus.status]?.label ?? linkStatus.status}
                                        </span>
                                    )}
                                    {linkStatus.expiresAt && !linkStatus.isPaid && linkStatus.status !== "error" && (
                                        <span className="text-xs text-muted">
                                            · expires {new Date(linkStatus.expiresAt).toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCheckStatus}
                            disabled={checkingStatus}
                            className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw size={12} className={checkingStatus ? "animate-spin" : ""} />
                            {checkingStatus ? "Checking..." : "Check payment status"}
                        </button>
                    </div>

                    {/* Paid success */}
                    {linkStatus?.isPaid && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-sm text-green-800">
                            <Check size={15} className="shrink-0" />
                            Payment confirmed — order has been auto-confirmed.
                        </div>
                    )}

                    {/* Expired — show regenerate */}
                    {linkStatus?.status === "expired" && canGenerate && (
                        <div className="space-y-2">
                            <p className="text-xs text-red-500">This link has expired. Generate a new one.</p>
                            <Button
                                variant="ghost"
                                className="w-full"
                                isLoading={mutation.isPending}
                                onClick={handleGenerate}
                            >
                                Regenerate link
                            </Button>
                        </div>
                    )}

                    {/* Unpaid + not expired — offer regenerate too */}
                    {linkStatus?.status === "created" && canGenerate && (
                        <button
                            onClick={handleGenerate}
                            disabled={mutation.isPending}
                            className="text-xs text-muted hover:text-foreground transition-colors"
                        >
                            Regenerate link
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-muted">
                        {order.paymentMode === "cod"
                            ? "Generate a link to let the customer pay online instead of cash on delivery."
                            : "Generate a payment link to share with the customer via WhatsApp."}
                    </p>
                    <Button className="w-full" isLoading={mutation.isPending} onClick={handleGenerate}>
                        <span className="flex items-center gap-2">
                            <Link2 size={15} /> Generate Payment Link
                        </span>
                    </Button>
                    {mutation.isError && (
                        <p className="text-xs text-red-500">
                            {(mutation.error as any)?.response?.data?.message ?? "Failed to generate link"}
                        </p>
                    )}
                </div>
            )
            }
        </div >
    );
}