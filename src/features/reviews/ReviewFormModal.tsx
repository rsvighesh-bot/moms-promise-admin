import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { StarRatingDisplay } from "../../components/ui/StarRatingDisplay";
import { useCreateReview, useUpdateReview } from "./useReviews";
import { type Review } from "./reviewApi";

// 0.5, 1, 1.5, ... 5 — half-star steps only
const RATING_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5);

const schema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerImage: z.string().optional(),
  rating: z.coerce
    .number()
    .min(0.5, "Rating is required")
    .max(5, "Rating can't exceed 5")
    .refine((v) => Number.isInteger(v * 2), "Must be a half-star step"),
  reviewText: z.string().min(1, "Review text is required"),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]).optional(),
});
type FormData = z.infer<typeof schema>;

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
}

const emptyDefaults: FormData = {
  customerName: "",
  customerImage: "",
  rating: 5,
  reviewText: "",
  sortOrder: 0,
  status: "active",
};

export function ReviewFormModal({
  isOpen,
  onClose,
  review,
}: ReviewFormModalProps) {
  const isEdit = !!review;
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
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
    reset(review ?? emptyDefaults);
  }, [review, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: review!._id, input: data },
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

  const currentRating = watch("rating");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Review" : "New Review"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Customer name"
          {...register("customerName")}
          error={errors.customerName?.message}
        />

        <ImageUploader
          value={watch("customerImage")}
          onChange={(url) => setValue("customerImage", url)}
        />
        <p className="text-xs text-muted -mt-2">
          Optional — customer photo/avatar shown alongside the review.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Rating</label>
          <div className="flex items-center gap-3">
            <select
              {...register("rating")}
              className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {RATING_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <StarRatingDisplay rating={currentRating} size={18} />
          </div>
          {errors.rating && (
            <span className="text-xs text-red-500">{errors.rating.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Review text</label>
          <textarea
            {...register("reviewText")}
            rows={4}
            className="px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {errors.reviewText && (
            <span className="text-xs text-red-500">
              {errors.reviewText.message}
            </span>
          )}
        </div>

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
