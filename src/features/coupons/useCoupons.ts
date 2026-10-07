import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCouponsAdmin,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
  type CouponFilters,
  type CouponInput,
} from "./couponApi";

const KEY = "coupons";

export function useCouponsList(filters: CouponFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchCouponsAdmin(filters, page),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Omit<Partial<CouponInput>, "code">;
    }) => updateCoupon(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useToggleCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
