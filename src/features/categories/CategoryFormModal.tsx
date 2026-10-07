import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { useCreateCategory, useUpdateCategory } from "./useCategories";
import { type Category } from "./categoryApi";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]),
});
type FormData = z.infer<typeof schema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null; // null = create mode
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const isEdit = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
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
    defaultValues: { name: "", imageUrl: "", sortOrder: 0, status: "active" },
  });

  // Reset form whenever a different category is opened (or switching to create mode)
  useEffect(() => {
    reset(
      category ?? { name: "", imageUrl: "", sortOrder: 0, status: "active" },
    );
  }, [category, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: category!._id, input: data },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "New Category"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Name"
          {...register("name")}
          error={errors.name?.message}
        />

        <ImageUploader
          value={watch("imageUrl")}
          onChange={(url) => setValue("imageUrl", url)}
        />

        <FormField
          label="Sort order"
          type="number"
          {...register("sortOrder")}
          error={errors.sortOrder?.message}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Status</label>
          <select
            {...register("status")}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

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
