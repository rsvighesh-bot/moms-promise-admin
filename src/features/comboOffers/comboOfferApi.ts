import { api } from "../../lib/api";

export type ComboDiscountType = "percentage" | "flat";

export interface ComboOfferProduct {
  _id: string;
  name: string;
  images: string[];
  sellingPrice: number; // paise
}

export interface ComboOffer {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productIds: ComboOfferProduct[];
  discountType: ComboDiscountType;
  discountValue: number; // percentage (1-100), or flat combo price in paise
  sortOrder: number;
  status: "active" | "inactive";
}

export interface ComboOfferListResponse {
  docs: ComboOffer[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface ComboOfferFilters {
  status?: string;
}

export const fetchComboOffersAdmin = async (
  filters: ComboOfferFilters,
  page: number,
): Promise<ComboOfferListResponse> => {
  const { data } = await api.get("/combo-offers/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

// Payload shape — productIds sent as plain string ids, not populated objects
export interface ComboOfferInput {
  name: string;
  imageUrl: string;
  productIds: string[];
  discountType: ComboDiscountType;
  discountValue: number;
  sortOrder: number;
  status?: "active" | "inactive";
}

export const createComboOffer = async (
  input: Omit<ComboOfferInput, "status">,
): Promise<ComboOffer> => {
  const { data } = await api.post("/combo-offers", input);
  return data.offer;
};

export const updateComboOffer = async (
  id: string,
  input: Partial<ComboOfferInput>,
): Promise<ComboOffer> => {
  const { data } = await api.put(`/combo-offers/${id}`, input);
  return data.offer;
};

// Soft delete — backend sets status to "inactive"
export const deleteComboOffer = async (id: string): Promise<ComboOffer> => {
  const { data } = await api.delete(`/combo-offers/${id}`);
  return data.offer;
};
