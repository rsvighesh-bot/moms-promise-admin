import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { useCreateKpiImage, useUpdateKpiImage } from "./useKpiImages";
import { type KpiImage } from "./kpiImageApi";

const schema = z.object({
  imageUrl: z.string().min(1, "Image is required"),
  linkUrl: z.string().optional(),
  title: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface KpiImageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: KpiImage | null;
}

const emptyDefaults: FormData = {
  imageUrl: "",
  linkUrl: "",
  title: "",
  sortOrder: 0,
  status: "active",
};

export function KpiImageFormModal({
  isOpen,
  onClose,
  image,
}: KpiImageFormModalProps) {
  const isEdit = !!image;
  const createMutation = useCreateKpiImage();
  const updateMutation = useUpdateKpiImage();
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
    reset(image ?? emptyDefaults);
  }, [image, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: image!._id, input: data },
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
      title={isEdit ? "Edit KPI Image" : "New KPI Image"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ImageUploader
          value={watch("imageUrl")}
          onChange={(url) => setValue("imageUrl", url)}
        />
        <p className="text-xs text-muted -mt-2">
          Landscape image, ~800×500px (8:5) — design it exactly as it should
          appear, this is shown as-is on the homepage.
        </p>
        {errors.imageUrl && (
          <span className="text-xs text-red-500">
            {errors.imageUrl.message}
          </span>
        )}

        <FormField
          label="Title (admin reference / alt text)"
          {...register("title")}
        />
        <FormField
          label="Link URL (optional)"
          placeholder="/products"
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
