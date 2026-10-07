import { api } from "../../lib/api";

export interface ShopByAge {
  _id: string;
  label: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder: number;
  status: "active" | "inactive";
}

export interface ShopByAgeListResponse {
  docs: ShopByAge[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface ShopByAgeFilters {
  status?: string;
}

export const fetchShopByAgeAdmin = async (
  filters: ShopByAgeFilters,
  page: number,
): Promise<ShopByAgeListResponse> => {
  const { data } = await api.get("/shop-by-age/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

// Used to populate the variant "Age" dropdown — every configured age group
// regardless of status, since an admin should still be able to pick an age
// that's temporarily hidden from the storefront.
export const fetchShopByAgeOptions = async (): Promise<ShopByAge[]> => {
  const { data } = await api.get("/shop-by-age/admin", {
    params: { limit: 100 },
  });
  return data.docs; // backend already sorts by sortOrder
};

export type ShopByAgeInput = Pick<
  ShopByAge,
  "label" | "imageUrl" | "linkUrl" | "sortOrder" | "status"
>;

export const createShopByAge = async (
  input: Omit<ShopByAgeInput, "status">,
): Promise<ShopByAge> => {
  const { data } = await api.post("/shop-by-age", input);
  return data.ageGroup;
};

export const updateShopByAge = async (
  id: string,
  input: Partial<ShopByAgeInput>,
): Promise<ShopByAge> => {
  const { data } = await api.put(`/shop-by-age/${id}`, input);
  return data.ageGroup;
};

// Soft delete — backend sets status to "inactive"
export const deleteShopByAge = async (id: string): Promise<ShopByAge> => {
  const { data } = await api.delete(`/shop-by-age/${id}`);
  return data.ageGroup;
};
