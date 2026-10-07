import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus, Trash2, ArrowLeft, Link2, Copy,
    Check, ShoppingCart, User, UserPlus, Truck,
} from "lucide-react";
import { useCreateManualOrder } from "./usePaymentLink";
import { ProductVariantPicker } from "./ProductVariantPicker";
import { CustomerSearch } from "./CustomerSearch";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";

// Tamil Nadu pincode check — mirrors backend logic exactly
const isTamilNaduPincode = (pincode: string) => pincode.startsWith("6");
const TN_SHIPPING = 50;
const OUTSIDE_TN_SHIPPING = 80;
const FREE_SHIPPING_ABOVE = 999;

const schema = z.object({
    customerMode: z.enum(["existing", "new"]),
    userId: z.string().optional(),
    customerName: z.string().min(1, "Name is required"),
    customerPhone: z.string().min(10, "Valid phone required").max(10),
    customerEmail: z.string().email().optional().or(z.literal("")),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().length(6, "Valid 6-digit pincode required"),
    items: z.array(z.object({
        productId: z.string().min(1, "Select a product"),
        variantId: z.string().min(1, "Select a variant"),
        quantity: z.coerce.number().min(1),
    })).min(1, "At least one item required"),
    shippingFeeOverride: z.coerce.number().min(0).optional(),
});
type FormData = z.infer<typeof schema>;

interface ItemMeta {
    productName: string;
    variantLabel: string;
    image?: string;
    price: number;
}

interface SelectedCustomer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export function ManualOrderPage() {
    const navigate = useNavigate();
    const mutation = useCreateManualOrder();
    const [copied, setCopied] = useState(false);
    const [itemMetas, setItemMetas] = useState<Record<number, ItemMeta>>({});
    const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);
    const [shippingOverrideEnabled, setShippingOverrideEnabled] = useState(false);

    const {
        register, handleSubmit, control, setValue, watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema as any),
        defaultValues: {
            customerMode: "new",
            items: [{ productId: "", variantId: "", quantity: 1 }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems = watch("items");
    const watchedPincode = watch("pincode");
    const watchedMode = watch("customerMode");
    const watchedOverride = watch("shippingFeeOverride");

    // Auto-fill customer details when existing customer selected
    useEffect(() => {
        if (selectedCustomer) {
            setValue("userId", selectedCustomer._id);
            setValue("customerName", selectedCustomer.name);
            setValue("customerPhone", selectedCustomer.phone ?? "");
            setValue("customerEmail", selectedCustomer.email);
        }
    }, [selectedCustomer, setValue]);

    // Calculate subtotal from item metas
    const subtotal = fields.reduce((sum, _, i) => {
        const meta = itemMetas[i];
        const item = watchedItems[i];
        if (!meta?.price || !item?.variantId) return sum;
        return sum + meta.price * (item.quantity || 1);
    }, 0);

    // Auto-calculated shipping based on pincode
    const autoShipping = (() => {
        if (subtotal / 100 >= FREE_SHIPPING_ABOVE) return 0;
        if (!watchedPincode || watchedPincode.length !== 6) return null;
        return isTamilNaduPincode(watchedPincode) ? TN_SHIPPING * 100 : OUTSIDE_TN_SHIPPING * 100;
    })();

    const effectiveShipping = shippingOverrideEnabled && watchedOverride !== undefined
        ? Math.round(watchedOverride * 100)
        : autoShipping;

    const grandTotal = subtotal + (effectiveShipping ?? 0);

    const handleCopy = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onSubmit = (data: FormData) => {
        const payload = {
            ...data,
            ...(shippingOverrideEnabled && data.shippingFeeOverride !== undefined
                ? { shippingFeeOverride: Math.round(data.shippingFeeOverride * 100) }
                : {}),
        };
        mutation.mutate(payload);
    };

    const backendError = (mutation.error as any)?.response?.data?.message as string | undefined;

    // Success state
    if (mutation.isSuccess && mutation.data) {
        const result = mutation.data;
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-surface border border-border rounded-lg p-6 space-y-5 text-center">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Link2 size={24} className="text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Order Created!</h2>
                        <p className="text-sm text-muted mt-1">
                            Order{" "}
                            <span className="font-data font-semibold text-foreground">{result.orderNumber}</span>{" "}
                            for <span className="font-semibold">{result.paymentLink.amountFormatted}</span>
                        </p>
                    </div>
                    <div className="bg-bg border border-border rounded-lg p-4 space-y-3 text-left">
                        <p className="text-sm font-medium">Payment link to share with customer</p>
                        <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2">
                            <span className="font-data text-xs text-muted flex-1 truncate">{result.paymentLink.url}</span>
                            <button
                                onClick={() => handleCopy(result.paymentLink.url)}
                                className="flex items-center gap-1 text-xs text-primary hover:opacity-80 shrink-0"
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                        <p className="text-xs text-muted">
                            Expires: {new Date(result.paymentLink.expiresAt).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-muted">
                            The order will auto-confirm once the customer pays via this link.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="flex-1" onClick={() => navigate("/orders")}>
                            View Orders
                        </Button>
                        <Button className="flex-1" onClick={() => navigate(`/orders/${result.orderNumber}`)}>
                            View This Order
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-6">
            <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4 transition-colors"
            >
                <ArrowLeft size={14} /> Back to Orders
            </button>

            <h1 className="text-xl font-bold mb-1">Create Manual Order</h1>
            <p className="text-sm text-muted mb-6">
                Create a phone order on behalf of a customer. A payment link will be auto-generated.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Customer — existing or new */}
                <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Customer</h2>

                    {/* Toggle */}
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button
                            type="button"
                            onClick={() => {
                                setValue("customerMode", "existing");
                                setSelectedCustomer(null);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors
                ${watchedMode === "existing"
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "bg-surface text-muted hover:bg-bg"
                                }`}
                        >
                            <User size={15} /> Existing customer
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setValue("customerMode", "new");
                                setValue("userId", undefined);
                                setSelectedCustomer(null);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors
                ${watchedMode === "new"
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "bg-surface text-muted hover:bg-bg"
                                }`}
                        >
                            <UserPlus size={15} /> New / independent customer
                        </button>
                    </div>

                    {watchedMode === "existing" && (
                        <div className="space-y-3">
                            <label className="text-xs font-medium">Search existing customer</label>
                            <CustomerSearch
                                value={selectedCustomer}
                                onChange={(c) => {
                                    setSelectedCustomer(c);
                                    if (!c) setValue("userId", undefined);
                                }}
                            />
                            {selectedCustomer && (
                                <p className="text-xs text-muted">
                                    Order will be linked to this account and visible in their order history.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Customer details — always shown, pre-filled for existing */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Full name"
                            {...register("customerName")}
                            error={errors.customerName?.message}
                        />
                        <FormField
                            label="Phone"
                            type="tel"
                            maxLength={10}
                            {...register("customerPhone")}
                            error={errors.customerPhone?.message}
                        />
                    </div>
                    <FormField
                        label="Email (optional)"
                        type="email"
                        {...register("customerEmail")}
                        error={errors.customerEmail?.message}
                    />
                </div>

                {/* Delivery address */}
                <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Delivery address</h2>
                    <FormField label="Address line 1" {...register("addressLine1")} error={errors.addressLine1?.message} />
                    <FormField label="Address line 2 (optional)" {...register("addressLine2")} />
                    <div className="grid grid-cols-3 gap-3">
                        <FormField label="City" {...register("city")} error={errors.city?.message} />
                        <FormField label="State" {...register("state")} error={errors.state?.message} />
                        <FormField label="Pincode" maxLength={6} {...register("pincode")} error={errors.pincode?.message} />
                    </div>

                    {/* Shipping charge preview */}
                    {watchedPincode?.length === 6 && (
                        <div className="flex items-start gap-3 px-3 py-2.5 bg-bg border border-border rounded-lg">
                            <Truck size={15} className="text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        {isTamilNaduPincode(watchedPincode) ? "Tamil Nadu delivery" : "Outside Tamil Nadu"}
                                    </span>
                                    <span className="font-data font-semibold text-sm">
                                        {subtotal / 100 >= FREE_SHIPPING_ABOVE
                                            ? "Free"
                                            : shippingOverrideEnabled && watchedOverride !== undefined
                                                ? `₹${watchedOverride}`
                                                : `₹${isTamilNaduPincode(watchedPincode) ? TN_SHIPPING : OUTSIDE_TN_SHIPPING}`}
                                    </span>
                                </div>

                                {/* Override toggle */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={shippingOverrideEnabled}
                                        onChange={(e) => {
                                            setShippingOverrideEnabled(e.target.checked);
                                            if (!e.target.checked) setValue("shippingFeeOverride", undefined);
                                        }}
                                        className="w-3.5 h-3.5 accent-primary"
                                    />
                                    <span className="text-xs text-muted">Override shipping charge</span>
                                </label>

                                {shippingOverrideEnabled && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            {...register("shippingFeeOverride")}
                                            placeholder={isTamilNaduPincode(watchedPincode) ? "50" : "80"}
                                            className="font-data w-24 px-2.5 py-1.5 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <span className="text-xs text-muted">Enter 0 for free shipping</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="bg-surface border border-border rounded-lg p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Items</h2>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => append({ productId: "", variantId: "", quantity: 1 })}
                        >
                            <span className="flex items-center gap-1"><Plus size={14} /> Add item</span>
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-3 pb-5 border-b border-border last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted font-medium">Item {index + 1}</span>
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            remove(index);
                                            setItemMetas((prev) => {
                                                const next = { ...prev };
                                                delete next[index];
                                                return next;
                                            });
                                        }}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 size={13} /> Remove
                                    </button>
                                )}
                            </div>

                            <ProductVariantPicker
                                index={index}
                                value={{
                                    productId: watchedItems[index]?.productId ?? "",
                                    variantId: watchedItems[index]?.variantId ?? "",
                                }}
                                onChange={({ productId, variantId }) => {
                                    setValue(`items.${index}.productId`, productId);
                                    setValue(`items.${index}.variantId`, variantId);
                                }}
                                onMetaChange={(meta) => {
                                    setItemMetas((prev) => ({
                                        ...prev,
                                        [index]: meta ?? { productName: "", variantLabel: "", price: 0 },
                                    }));
                                }}
                                error={
                                    errors.items?.[index]?.productId?.message ||
                                    errors.items?.[index]?.variantId?.message
                                }
                            />

                            {watchedItems[index]?.variantId && (
                                <div className="flex items-center gap-3">
                                    <label className="text-xs font-medium">Quantity</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const current = watchedItems[index]?.quantity ?? 1;
                                                if (current > 1) setValue(`items.${index}.quantity`, current - 1);
                                            }}
                                            className="w-8 h-8 rounded-md border border-border bg-bg hover:bg-surface flex items-center justify-center font-data font-bold"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            {...register(`items.${index}.quantity`)}
                                            className="w-16 text-center font-data px-2 py-1.5 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const current = watchedItems[index]?.quantity ?? 1;
                                                setValue(`items.${index}.quantity`, current + 1);
                                            }}
                                            className="w-8 h-8 rounded-md border border-border bg-bg hover:bg-surface flex items-center justify-center font-data font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Live order summary */}
                {watchedItems.some((item) => item.variantId) && (
                    <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
                        <div className="flex items-center gap-2 font-semibold">
                            <ShoppingCart size={16} /> Order summary
                        </div>

                        {fields.map((field, index) => {
                            const meta = itemMetas[index];
                            const item = watchedItems[index];
                            if (!meta?.price || !item?.variantId) return null;
                            const lineTotal = meta.price * (item.quantity || 1);
                            return (
                                <div key={field.id} className="flex items-center gap-3">
                                    {meta.image && (
                                        <img src={meta.image} alt="" className="w-10 h-10 rounded-md object-cover ring-1 ring-border shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{meta.productName}</div>
                                        <div className="text-xs text-muted">{meta.variantLabel}</div>
                                    </div>
                                    <div className="text-sm font-data text-right shrink-0">
                                        <div className="text-muted">₹{(meta.price / 100).toLocaleString("en-IN")} × {item.quantity || 1}</div>
                                        <div className="font-semibold">₹{(lineTotal / 100).toLocaleString("en-IN")}</div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-2 border-t border-border space-y-1.5 font-data text-sm">
                            <div className="flex justify-between text-muted">
                                <span>Subtotal</span>
                                <span>₹{(subtotal / 100).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-muted">
                                <span>Shipping</span>
                                <span>
                                    {effectiveShipping === null
                                        ? <span className="text-xs">Enter pincode</span>
                                        : effectiveShipping === 0
                                            ? <span className="text-green-600">Free</span>
                                            : `₹${(effectiveShipping / 100).toLocaleString("en-IN")}`
                                    }
                                    {shippingOverrideEnabled && (
                                        <span className="ml-1 text-xs text-accent-foreground">(override)</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold text-base pt-1 border-t border-border">
                                <span>Total</span>
                                <span>
                                    {effectiveShipping === null
                                        ? "—"
                                        : `₹${(grandTotal / 100).toLocaleString("en-IN")}`}
                                </span>
                            </div>
                        </div>

                        {subtotal / 100 < FREE_SHIPPING_ABOVE && !shippingOverrideEnabled && watchedPincode?.length === 6 && (
                            <p className="text-xs text-muted">
                                Add ₹{FREE_SHIPPING_ABOVE - subtotal / 100} more to unlock free shipping.
                            </p>
                        )}
                    </div>
                )}

                {backendError && <p className="text-sm text-red-500">{backendError}</p>}

                <Button type="submit" isLoading={mutation.isPending} className="w-full">
                    <span className="flex items-center gap-2">
                        <Link2 size={15} /> Create Order & Generate Payment Link
                    </span>
                </Button>
            </form>
        </div>
    );
}