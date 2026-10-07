import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { MultiImageUploader } from "../../components/ui/MultiImageUploader";
import { useActiveCategories } from "../categories/useActiveCategories";
import { useSubCategoriesList } from "../subcategories/useSubCategories";
import { useCreateProduct, useUpdateProduct } from "./useProducts";
import { type Product } from "./productApi";
import { paiseToRupees, rupeesToPaise } from "../../lib/format";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { RichTextEditor } from "../../components/ui/RichTextEditor";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "Subcategory is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  mrp: z.coerce.number().positive("MRP is required"),
  sellingPrice: z.coerce.number().positive("Selling price is required"),
  sizeSpecification: z.string().optional(),
  washCare: z
    .string()
    .optional()
    .transform((val) => (val === "<p></p>" || val === "" ? undefined : val)),
  status: z.enum(["active", "draft", "out_of_stock"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null; // null = create mode
}

const emptyDefaults: FormData = {
  name: "",
  sku: "",
  brand: "",
  categoryId: "",
  subCategoryId: "",
  description: "",
  shortDescription: "",
  images: [],
  mrp: 0,
  sellingPrice: 0,
  sizeSpecification: "",
  washCare: "",
  status: "draft",
};

// Small section wrapper — gives every group of fields a consistent
// eyebrow label + divider so the longer form reads as scannable
// chunks instead of one long stack.
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:col-span-2 border-t border-border first:border-t-0 first:pt-0 pt-5 mt-1 first:mt-0">
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted/80 mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const { data: categories } = useActiveCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
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

  const categoryId = watch("categoryId");
  const { data: subCategories } = useSubCategoriesList(categoryId, "active");

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        mrp: paiseToRupees(product.mrp),
        sellingPrice: paiseToRupees(product.sellingPrice),
      });
    } else {
      reset(emptyDefaults);
    }
  }, [product, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      mrp: rupeesToPaise(data.mrp),
      sellingPrice: rupeesToPaise(data.sellingPrice),
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: product!._id, input: payload },
        { onSuccess: onClose },
      );
    } else {
      const { status, ...createPayload } = payload; // status not accepted on create
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
      title={isEdit ? "Edit Product" : "New Product"}
      size="wide"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
          {/* Identity */}
          <Section title="Identity">
            <div className="lg:col-span-2">
              <FormField
                label="Name"
                {...register("name")}
                error={errors.name?.message}
              />
            </div>
            <FormField
              label="SKU"
              {...register("sku")}
              error={errors.sku?.message}
            />
            <FormField label="Brand" {...register("brand")} />
          </Section>

          {/* Categorization */}
          <Section title="Categorization">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Category</label>
              <select
                {...register("categoryId")}
                onChange={(e) => {
                  setValue("categoryId", e.target.value);
                  setValue("subCategoryId", ""); // reset child selection on category change
                }}
                className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select...</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-xs text-red-500">
                  {errors.categoryId.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Subcategory</label>
              <select
                {...register("subCategoryId")}
                disabled={!categoryId}
                className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">
                  {categoryId ? "Select..." : "Pick a category first"}
                </option>
                {subCategories?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.subCategoryId && (
                <span className="text-xs text-red-500">
                  {errors.subCategoryId.message}
                </span>
              )}
            </div>
          </Section>

          {/* Content */}
          <Section
            title="Content"
            description="What customers see on the product page."
          >
            <div className="lg:col-span-2">
              <FormField
                label="Short description"
                {...register("shortDescription")}
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </Section>

          {/* Media */}
          <Section title="Media">
            <div className="lg:col-span-2">
              <MultiImageUploader
                value={watch("images")}
                onChange={(urls) =>
                  setValue("images", urls, { shouldValidate: true })
                }
              />
              {errors.images && (
                <span className="text-xs text-red-500">
                  {errors.images.message}
                </span>
              )}
            </div>

            {/* Size specification — image upload since it's a size chart photo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Size chart (optional)
              </label>
              <p className="text-xs text-muted -mt-1">
                Shown on the product page to help customers pick the right
                age/size.
              </p>
              <ImageUploader
                value={watch("sizeSpecification")}
                onChange={(url) => setValue("sizeSpecification", url)}
              />
            </div>

            {/* Wash care — text editor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Wash care (optional)
              </label>
              <RichTextEditor
                value={watch("washCare") ?? ""}
                onChange={(html) =>
                  setValue("washCare", html, { shouldDirty: true })
                }
                placeholder="e.g. Machine wash cold. Do not bleach. Tumble dry low."
              />
            </div>
          </Section>

          {/* Pricing & status */}
          <Section title="Pricing & status">
            <FormField
              label="MRP (₹) *"
              type="number"
              step="0.01"
              {...register("mrp")}
              error={errors.mrp?.message}
            />
            <FormField
              label="Selling price (₹) *"
              type="number"
              step="0.01"
              {...register("sellingPrice")}
              error={errors.sellingPrice?.message}
            />

            {isEdit && (
              <div className="lg:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium">Status</label>
                <select
                  {...register("status")}
                  className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary lg:w-1/2"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
                <p className="text-xs text-muted">
                  Activating requires at least one active variant — add variants
                  first if this fails.
                </p>
              </div>
            )}
          </Section>
        </div>

        {backendError && (
          <p className="text-sm text-red-500 mt-4">{backendError}</p>
        )}

        <div className="flex justify-end gap-2 pt-5 mt-1 border-t border-border">
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
