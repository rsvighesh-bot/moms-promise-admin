import { api } from "../../lib/api";

export interface LinkedProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
}

export interface ShopVideo {
  _id: string;
  videoUrl: string;
  productId?: LinkedProduct | null;
  caption?: string;
  sortOrder: number;
  status: "active" | "inactive";
}

export interface ShopVideoListResponse {
  docs: ShopVideo[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface ShopVideoFilters {
  status?: string;
}

export const fetchShopVideosAdmin = async (
  filters: ShopVideoFilters,
  page: number,
): Promise<ShopVideoListResponse> => {
  const { data } = await api.get("/shop-videos/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

// Payload shape — productId sent as a plain string id (or omitted/empty to unlink)
export interface ShopVideoInput {
  videoUrl: string;
  productId?: string;
  caption?: string;
  sortOrder: number;
  status?: "active" | "inactive";
}

export const createShopVideo = async (
  input: Omit<ShopVideoInput, "status">,
): Promise<ShopVideo> => {
  const { data } = await api.post("/shop-videos", input);
  return data.video;
};

export const updateShopVideo = async (
  id: string,
  input: Partial<ShopVideoInput>,
): Promise<ShopVideo> => {
  const { data } = await api.put(`/shop-videos/${id}`, input);
  return data.video;
};

// Soft delete — backend sets status to "inactive"
export const deleteShopVideo = async (id: string): Promise<ShopVideo> => {
  const { data } = await api.delete(`/shop-videos/${id}`);
  return data.video;
};
