import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { useCreateShopByAge, useUpdateShopByAge } from "./useShopByAge";
import { type ShopByAge } from "./shopByAgeApi";

const schema = z.object({
  label: z.string().min(1, "Age label is required"),
  imageUrl: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface ShopByAgeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ageGroup: ShopByAge | null;
}

const emptyDefaults: FormData = {
  label: "",
  imageUrl: "",
  sortOrder: 0,
  status: "active",
};

export function ShopByAgeFormModal({
  isOpen,
  onClose,
  ageGroup,
}: ShopByAgeFormModalProps) {
  const isEdit = !!ageGroup;
  const createMutation = useCreateShopByAge();
  const updateMutation = useUpdateShopByAge();
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
    reset(ageGroup ?? emptyDefaults);
  }, [ageGroup, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: ageGroup!._id, input: data },
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
      title={isEdit ? "Edit Age Group" : "New Age Group"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Age label"
          placeholder="e.g. 2-3 or 0 to 3 months"
          {...register("label")}
          error={errors.label?.message}
        />
        <p className="text-xs text-muted -mt-2">
          This is also the value used for the product variant &quot;Age&quot;
          field, and what the storefront searches/filters by — matching
          product SKUs need to use this exact label. The homepage tile and
          age filter link to it automatically, no URL needed.
        </p>

        <ImageUploader
          value={watch("imageUrl")}
          onChange={(url) => setValue("imageUrl", url)}
        />
        <p className="text-xs text-muted -mt-2">
          Optional — only needed if this age group should appear as an image
          tile on the storefront homepage.
        </p>
        {errors.imageUrl && (
          <span className="text-xs text-red-500">
            {errors.imageUrl.message}
          </span>
        )}

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
