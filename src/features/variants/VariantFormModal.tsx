import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { MultiImageUploader } from "../../components/ui/MultiImageUploader";
import { useShopByAgeOptions } from "../shopByAge/useShopByAge";
import { useCreateVariant, useUpdateVariant } from "./useVariants";
import { type Variant } from "./variantApi";
import { type Product } from "../products/productApi";
import { ColorPicker } from "../../components/ui/ColorPicker";
import { paiseToRupees, rupeesToPaise } from "../../lib/format";

const schema = z.object({
  sku: z.string().min(1, "SKU is required"),
  age: z.string().min(1, "Age is required"),
  color: z.string().optional(),
  size: z.string().optional(),
  images: z.array(z.string()).default([]),
  stockQuantity: z.coerce.number().min(0).default(0),
  lowStockThreshold: z.coerce.number().min(0).default(5),
  priceOverride: z.coerce.number().optional(),
  mrpOverride: z.coerce.number().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface VariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  product: Product | undefined; // needed for price pre-fill
  variant: Variant | null;
}

export function VariantFormModal({
  isOpen,
  onClose,
  productId,
  product,
  variant,
}: VariantFormModalProps) {
  const isEdit = !!variant;
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();
  const mutation = isEdit ? updateMutation : createMutation;
  const { data: ageOptions = [] } = useShopByAgeOptions();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: buildDefaults(variant, product),
  });

  // Re-populate whenever the modal opens with a different context —
  // isOpen is in the deps so that closing and reopening in create mode
  // (where variant stays null both times) still triggers a reset.
  useEffect(() => {
    if (isOpen) {
      reset(buildDefaults(variant, product));
    }
  }, [isOpen, variant, product, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      productId,
      priceOverride: data.priceOverride
        ? rupeesToPaise(data.priceOverride)
        : undefined,
      mrpOverride: data.mrpOverride
        ? rupeesToPaise(data.mrpOverride)
        : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: variant!._id, input: payload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          reset(buildDefaults(null, product)); // clear for next entry before closing
          onClose();
        },
      });
    }
  };

  const backendError = (mutation.error as any)?.response?.data?.message as
    | string
    | undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Variant" : "New Variant"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormField
              label="SKU"
              {...register("sku")}
              error={errors.sku?.message}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Age</label>
            <select
              {...register("age")}
              className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select...</option>
              {ageOptions.map((a) => (
                <option key={a._id} value={a.label}>
                  {a.label}
                </option>
              ))}
              {/* Keep an existing variant's age selectable even if it was
                  since removed/renamed in Shop by Age, so editing doesn't
                  silently reset it. */}
              {variant?.age &&
                !ageOptions.some((a) => a.label === variant.age) && (
                  <option value={variant.age}>{variant.age}</option>
                )}
            </select>
            {ageOptions.length === 0 && (
              <span className="text-xs text-muted">
                No age groups configured yet — add one under Shop by Age.
              </span>
            )}
            {errors.age && (
              <span className="text-xs text-red-500">{errors.age.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <ColorPicker
              value={watch("color")}
              onChange={(name) => setValue("color", name)}
            />
          </div>
          <FormField label="Size (optional)" {...register("size")} />
        </div>

        <MultiImageUploader
          value={watch("images")}
          onChange={(urls) => setValue("images", urls)}
        />
        <p className="text-xs text-muted -mt-2">
          Leave empty to use the product's default images.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Stock quantity"
            type="number"
            {...register("stockQuantity")}
            error={errors.stockQuantity?.message}
          />
          <FormField
            label="Low stock alert at"
            type="number"
            {...register("lowStockThreshold")}
            error={errors.lowStockThreshold?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="MRP override (₹)"
            type="number"
            step="0.01"
            {...register("mrpOverride")}
          />
          <FormField
            label="Selling price override (₹)"
            type="number"
            step="0.01"
            {...register("priceOverride")}
          />
        </div>
        <p className="text-xs text-muted -mt-2">
          Pre-filled from product base pricing — clear both to use defaults, or
          edit to override per variant.
        </p>

        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              {...register("status")}
              className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

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

// Extracted so both the defaultValues and reset() calls use the same logic —
// one place to change if the defaults ever need adjusting.
function buildDefaults(
  variant: Variant | null,
  product: Product | undefined,
): FormData {
  if (variant) {
    return {
      ...variant,
      priceOverride:
        variant.priceOverride !== undefined
          ? paiseToRupees(variant.priceOverride)
          : undefined,
      mrpOverride:
        variant.mrpOverride !== undefined
          ? paiseToRupees(variant.mrpOverride)
          : undefined,
    };
  }
  // Create mode — pre-fill price fields from product base pricing
  return {
    sku: "",
    age: "",
    color: "",
    size: "",
    images: [],
    stockQuantity: 0,
    lowStockThreshold: 5,
    status: "active",
    mrpOverride: product ? paiseToRupees(product.mrp) : undefined,
    priceOverride: product ? paiseToRupees(product.sellingPrice) : undefined,
  };
}
