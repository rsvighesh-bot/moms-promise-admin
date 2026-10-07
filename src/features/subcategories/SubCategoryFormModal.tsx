import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateSubCategory, useUpdateSubCategory } from "./useSubCategories";
import { type SubCategory } from "./subCategoryApi";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface SubCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  subCategory: SubCategory | null;
}

export function SubCategoryFormModal({
  isOpen,
  onClose,
  categoryId,
  subCategory,
}: SubCategoryFormModalProps) {
  const isEdit = !!subCategory;
  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", status: "active" },
  });

  useEffect(() => {
    reset(subCategory ?? { name: "", status: "active" });
  }, [subCategory, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: subCategory!._id, input: data },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(
        { categoryId, name: data.name },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit SubCategory" : "New SubCategory"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Name"
          {...register("name")}
          error={errors.name?.message}
        />

        {isEdit && (
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
        )}

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
