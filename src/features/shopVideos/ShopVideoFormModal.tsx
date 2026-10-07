import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { VideoUploader } from "../../components/ui/VideoUploader";
import { ProductLinkPicker } from "./ProductLinkPicker";
import { useCreateShopVideo, useUpdateShopVideo } from "./useShopVideos";
import { type ShopVideo, type LinkedProduct } from "./shopVideoApi";

const schema = z.object({
  videoUrl: z.string().min(1, "Video is required"),
  productId: z.string().optional(),
  caption: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface ShopVideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: ShopVideo | null;
}

const emptyDefaults: FormData = {
  videoUrl: "",
  productId: "",
  caption: "",
  sortOrder: 0,
  status: "active",
};

export function ShopVideoFormModal({
  isOpen,
  onClose,
  video,
}: ShopVideoFormModalProps) {
  const isEdit = !!video;
  const createMutation = useCreateShopVideo();
  const updateMutation = useUpdateShopVideo();
  const mutation = isEdit ? updateMutation : createMutation;

  // The picker works with the full product object (name/image for
  // display); the form itself only needs the id.
  const [linkedProduct, setLinkedProduct] = useState<LinkedProduct | null>(
    null,
  );

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

  useEffect(() => {
    if (!isOpen) return;
    if (video) {
      setLinkedProduct(video.productId ?? null);
      reset({
        videoUrl: video.videoUrl,
        productId: video.productId?._id ?? "",
        caption: video.caption ?? "",
        sortOrder: video.sortOrder,
        status: video.status,
      });
    } else {
      setLinkedProduct(null);
      reset(emptyDefaults);
    }
  }, [isOpen, video, reset]);

  const handleProductChange = (product: LinkedProduct | null) => {
    setLinkedProduct(product);
    setValue("productId", product?._id ?? "");
  };

  const onSubmit = (data: FormData) => {
    const payload = { ...data, productId: data.productId || undefined };

    if (isEdit) {
      updateMutation.mutate(
        { id: video!._id, input: payload },
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
      title={isEdit ? "Edit Video" : "New Video"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <VideoUploader
          value={watch("videoUrl")}
          onChange={(url) => setValue("videoUrl", url)}
        />
        <p className="text-xs text-muted -mt-2">
          Vertical video (9:16) — this is the TikTok-style clip shown on the
          homepage.
        </p>
        {errors.videoUrl && (
          <span className="text-xs text-red-500">
            {errors.videoUrl.message}
          </span>
        )}

        <ProductLinkPicker value={linkedProduct} onChange={handleProductChange} />

        <FormField
          label="Caption (optional)"
          placeholder="e.g. Comfy co-ords for playdates"
          {...register("caption")}
        />
        <FormField
          label="Sort order"
          type="number"
          {...register("sortOrder")}
          error={errors.sortOrder?.message}
        />

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
