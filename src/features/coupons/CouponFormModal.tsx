import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateCoupon, useUpdateCoupon } from "./useCoupons";
import { type Coupon } from "./couponApi";
import { paiseToRupees, rupeesToPaise } from "../../lib/format";

const schema = z
  .object({
    code: z.string().min(1, "Code is required").toUpperCase(),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.coerce.number().min(1, "Must be at least 1"),
    minCartValue: z.coerce.number().min(0, "Must be 0 or more"),
    maxDiscountAmount: z.coerce.number().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (d) =>
      d.discountType !== "percentage" ||
      (d.discountValue >= 1 && d.discountValue <= 100),
    {
      message: "Percentage must be between 1 and 100",
      path: ["discountValue"],
    },
  );

type FormData = z.infer<typeof schema>;

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
}

const emptyDefaults: FormData = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minCartValue: 0,
  maxDiscountAmount: undefined,
  isActive: true,
};

export function CouponFormModal({
  isOpen,
  onClose,
  coupon,
}: CouponFormModalProps) {
  const isEdit = !!coupon;
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: emptyDefaults,
  });

  const discountType = watch("discountType");

  useEffect(() => {
    if (isOpen) {
      reset(
        coupon
          ? {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              minCartValue: paiseToRupees(coupon.minCartValue),
              maxDiscountAmount: coupon.maxDiscountAmount
                ? paiseToRupees(coupon.maxDiscountAmount)
                : undefined,
              isActive: coupon.isActive,
            }
          : emptyDefaults,
      );
    }
  }, [isOpen, coupon, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      // discountValue stays as-is for percentage (it's just "10" not paise)
      // but for flat type it's a rupee amount that needs converting to paise
      discountValue:
        data.discountType === "flat"
          ? rupeesToPaise(data.discountValue)
          : data.discountValue,
      minCartValue: rupeesToPaise(data.minCartValue),
      maxDiscountAmount: data.maxDiscountAmount
        ? rupeesToPaise(data.maxDiscountAmount)
        : undefined,
    };

    if (isEdit) {
      const { code, ...updatePayload } = payload; // code not updatable
      updateMutation.mutate(
        { id: coupon!._id, input: updatePayload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const backendError = (mutation.error as any)?.response?.data?.message as
    | string
    | undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Coupon" : "New Coupon"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Code — read-only in edit mode */}
        {isEdit ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Code</label>
            <div className="font-data px-3 py-2.5 rounded-md border border-border bg-bg text-muted">
              {coupon!.code}
            </div>
            <p className="text-xs text-muted">
              Coupon codes cannot be changed after creation.
            </p>
          </div>
        ) : (
          <FormField
            label="Code"
            placeholder="e.g. SAVE10"
            {...register("code")}
            error={errors.code?.message}
            className="uppercase"
          />
        )}

        {/* Discount type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Discount type</label>
          <select
            {...register("discountType")}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat amount (₹)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label={
              discountType === "percentage"
                ? "Discount (%)"
                : "Flat discount (₹)"
            }
            type="number"
            step={discountType === "percentage" ? "1" : "0.01"}
            {...register("discountValue")}
            error={errors.discountValue?.message}
          />
          <FormField
            label="Min. cart value (₹)"
            type="number"
            step="0.01"
            {...register("minCartValue")}
            error={errors.minCartValue?.message}
          />
        </div>

        {/* Only show cap for percentage — a flat discount is already its own cap */}
        {discountType === "percentage" && (
          <FormField
            label="Max discount amount (₹, optional)"
            type="number"
            step="0.01"
            placeholder="Leave empty for no cap"
            {...register("maxDiscountAmount")}
          />
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("isActive")}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-medium">Active</span>
        </label>

        {backendError && <p className="text-sm text-red-500">{backendError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
