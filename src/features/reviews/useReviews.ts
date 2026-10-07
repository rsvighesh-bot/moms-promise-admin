import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchReviewsAdmin,
  createReview,
  updateReview,
  deleteReview,
  type ReviewFilters,
  type ReviewInput,
} from "./reviewApi";

const KEY = "reviews";

export function useReviewsList(filters: ReviewFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchReviewsAdmin(filters, page),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ReviewInput> }) =>
      updateReview(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
