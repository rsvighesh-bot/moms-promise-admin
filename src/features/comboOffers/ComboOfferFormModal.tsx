import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { ComboProductPicker } from "./ComboProductPicker";
import { useCreateComboOffer, useUpdateComboOffer } from "./useComboOffers";
import { type ComboOffer, type ComboOfferProduct } from "./comboOfferApi";
import { paiseToRupees, rupeesToPaise } from "../../lib/format";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    imageUrl: z.string().min(1, "Image is required"),
    productIds: z.array(z.string()).min(2, "Select at least 2 products"),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.coerce.number().min(1, "Must be at least 1"),
    sortOrder: z.coerce.number().default(0),
    status: z.enum(["active", "inactive"]).optional(),
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

interface ComboOfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: ComboOffer | null;
}

const emptyDefaults: FormData = {
  name: "",
  imageUrl: "",
  productIds: [],
  discountType: "percentage",
  discountValue: 10,
  sortOrder: 0,
  status: "active",
};

export function ComboOfferFormModal({
  isOpen,
  onClose,
  offer,
}: ComboOfferFormModalProps) {
  const isEdit = !!offer;
  const createMutation = useCreateComboOffer();
  const updateMutation = useUpdateComboOffer();
  const mutation = isEdit ? updateMutation : createMutation;

  // The picker works with full product objects (name/image/price for
  // display); the form itself only needs the ids for validation/submission.
  const [selectedProducts, setSelectedProducts] = useState<
    ComboOfferProduct[]
  >([]);
  const [squareWarning, setSquareWarning] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: emptyDefaults,
  });

  const discountType = watch("discountType");
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (!isOpen) return;
    if (offer) {
      setSelectedProducts(offer.productIds);
      reset({
        name: offer.name,
        imageUrl: offer.imageUrl,
        productIds: offer.productIds.map((p) => p._id),
        discountType: offer.discountType,
        discountValue:
          offer.discountType === "flat"
            ? paiseToRupees(offer.discountValue)
            : offer.discountValue,
        sortOrder: offer.sortOrder,
        status: offer.status,
      });
    } else {
      setSelectedProducts([]);
      reset(emptyDefaults);
    }
  }, [isOpen, offer, reset]);

  // Soft, non-blocking heads-up if the uploaded image isn't square —
  // there's no cropper in this admin, so we just flag it for a re-upload.
  useEffect(() => {
    if (!imageUrl) {
      setSquareWarning(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setSquareWarning(Math.abs(img.naturalWidth - img.naturalHeight) > 4);
    };
    img.onerror = () => setSquareWarning(false);
    img.src = imageUrl;
  }, [imageUrl]);

  const handleProductsChange = (products: ComboOfferProduct[]) => {
    setSelectedProducts(products);
    setValue(
      "productIds",
      products.map((p) => p._id),
      { shouldValidate: true },
    );
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      discountValue:
        data.discountType === "flat"
          ? rupeesToPaise(data.discountValue)
          : data.discountValue,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: offer!._id, input: payload },
        { onSuccess: onClose },
      );
    } else {
      const { status, ...createPayload } = payload;
      createMutation.mutate(createPayload, { onSuccess: onClose });
    }
  };

  const backendError = (mutation.error as any)?.response?.data?.message as
    | string
    | undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Combo Offer" : "New Combo Offer"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Offer name"
          placeholder="e.g. Back to School Combo"
          {...register("name")}
          error={errors.name?.message}
        />

        <div>
          <ImageUploader
            value={imageUrl}
            onChange={(url) => setValue("imageUrl", url)}
          />
          <p className="text-xs text-muted mt-1.5">
            Use a square (1:1) image — this is shown as a tile on the
            homepage.
          </p>
          {squareWarning && (
            <p className="text-xs text-amber-600 mt-1">
              This image isn&apos;t square — it may look cropped/stretched on
              the homepage tile.
            </p>
          )}
          {errors.imageUrl && (
            <span className="text-xs text-red-500">
              {errors.imageUrl.message}
            </span>
          )}
        </div>

        <ComboProductPicker
          value={selectedProducts}
          onChange={handleProductsChange}
          error={errors.productIds?.message}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Pricing</label>
          <select
            {...register("discountType")}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="percentage">Percentage off combined price</option>
            <option value="flat">Flat price for the whole combo</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label={
              discountType === "percentage"
                ? "Discount (%)"
                : "Combo price (₹)"
            }
            type="number"
            step={discountType === "percentage" ? "1" : "0.01"}
            {...register("discountValue")}
            error={errors.discountValue?.message}
          />
          <FormField
            label="Sort order"
            type="number"
            {...register("sortOrder")}
            error={errors.sortOrder?.message}
          />
        </div>

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
