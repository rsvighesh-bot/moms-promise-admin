import { api } from "../../lib/api";

export type VariantStatus = "active" | "inactive";

export interface Variant {
  _id: string;
  productId: string;
  sku: string;
  age: string;
  color?: string;
  size?: string;
  images: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  priceOverride?: number; // paise
  mrpOverride?: number; // paise
  status: VariantStatus;
}

export const fetchVariantsAdmin = async (
  productId: string,
  status: string,
): Promise<Variant[]> => {
  const { data } = await api.get("/variants/admin", {
    params: { productId, status },
  });
  return data.variants;
};

export interface VariantInput {
  productId: string;
  sku: string;
  age: string;
  color?: string;
  size?: string;
  images: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  priceOverride?: number;
  mrpOverride?: number;
  status?: VariantStatus;
}

export const createVariant = async (input: VariantInput): Promise<Variant> => {
  const { data } = await api.post("/variants", input);
  return data.variant;
};

export const updateVariant = async (
  id: string,
  input: Partial<VariantInput>,
): Promise<Variant> => {
  const { data } = await api.put(`/variants/${id}`, input);
  return data.variant;
};

// Soft delete — backend sets status to "inactive"
export const deleteVariant = async (id: string): Promise<Variant> => {
  const { data } = await api.delete(`/variants/${id}`);
  return data.variant;
};
