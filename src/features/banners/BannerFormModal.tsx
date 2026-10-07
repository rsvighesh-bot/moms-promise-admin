import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { useCreateBanner, useUpdateBanner } from "./useBanners";
import { type Banner } from "./bannerApi";

const schema = z.object({
  imageUrl: z.string().min(1, "Image is required"),
  linkUrl: z.string().optional(),
  title: z.string().optional(),
  device: z.enum(["all", "desktop", "mobile"]),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
}

const emptyDefaults: FormData = {
  imageUrl: "",
  linkUrl: "",
  title: "",
  device: "desktop",
  sortOrder: 0,
  status: "active",
};

export function BannerFormModal({
  isOpen,
  onClose,
  banner,
}: BannerFormModalProps) {
  const isEdit = !!banner;
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const mutation = isEdit ? updateMutation : createMutation;

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
    reset(banner ?? emptyDefaults);
  }, [banner, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: banner!._id, input: data },
        { onSuccess: onClose },
      );
    } else {
      const { status, ...createPayload } = data;
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
      title={isEdit ? "Edit Banner" : "New Banner"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ImageUploader
          value={watch("imageUrl")}
          onChange={(url) => setValue("imageUrl", url)}
        />
        {errors.imageUrl && (
          <span className="text-xs text-red-500">
            {errors.imageUrl.message}
          </span>
        )}

        <FormField
          label="Title (admin reference / alt text)"
          {...register("title")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Show on</label>
          <select
            {...register("device")}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="desktop">Desktop only</option>
            <option value="mobile">Mobile only</option>
            <option value="all">Both (desktop &amp; mobile)</option>
          </select>
          <p className="text-xs text-muted">
            Desktop and mobile banners usually need different crops — upload
            one image per device.
          </p>
        </div>

        <FormField
          label="Link URL (optional)"
          placeholder="/c/boys"
          {...register("linkUrl")}
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
