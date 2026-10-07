import { api } from "../../lib/api";

export type DiscountType = "percentage" | "flat";

export interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minCartValue: number; // paise
  maxDiscountAmount?: number; // paise, only relevant for percentage
  isActive: boolean;
  createdAt: string;
}

export interface CouponListResponse {
  docs: Coupon[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface CouponFilters {
  isActive?: string; // "true" | "false" | "" (all)
}

export const fetchCouponsAdmin = async (
  filters: CouponFilters,
  page: number,
): Promise<CouponListResponse> => {
  const { data } = await api.get("/coupons/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

export interface CouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minCartValue: number;
  maxDiscountAmount?: number;
  isActive?: boolean;
}

export const createCoupon = async (input: CouponInput): Promise<Coupon> => {
  const { data } = await api.post("/coupons", input);
  return data.coupon;
};

// Code is intentionally excluded — backend doesn't allow code changes
export const updateCoupon = async (
  id: string,
  input: Omit<Partial<CouponInput>, "code">,
): Promise<Coupon> => {
  const { data } = await api.put(`/coupons/${id}`, input);
  return data.coupon;
};

// Dedicated toggle endpoint — most common operation
export const toggleCoupon = async (id: string): Promise<Coupon> => {
  const { data } = await api.patch(`/coupons/${id}/toggle`);
  return data.coupon;
};

// Hard delete — safe because orders snapshot the code string, not a FK
export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};
