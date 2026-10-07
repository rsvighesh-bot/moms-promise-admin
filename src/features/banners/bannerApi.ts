import { api } from "../../lib/api";

export type BannerDevice = "all" | "desktop" | "mobile";

export interface Banner {
  _id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  device: BannerDevice;
  sortOrder: number;
  status: "active" | "inactive";
}

export interface BannerListResponse {
  docs: Banner[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface BannerFilters {
  status?: string;
}

export const fetchBannersAdmin = async (
  filters: BannerFilters,
  page: number,
): Promise<BannerListResponse> => {
  const { data } = await api.get("/banners/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

export type BannerInput = Pick<
  Banner,
  "imageUrl" | "linkUrl" | "title" | "device" | "sortOrder" | "status"
>;

export const createBanner = async (
  input: Omit<BannerInput, "status">,
): Promise<Banner> => {
  const { data } = await api.post("/banners", input);
  return data.banner;
};

export const updateBanner = async (
  id: string,
  input: Partial<BannerInput>,
): Promise<Banner> => {
  const { data } = await api.put(`/banners/${id}`, input);
  return data.banner;
};

// Soft delete — backend sets status to "inactive"
export const deleteBanner = async (id: string): Promise<Banner> => {
  const { data } = await api.delete(`/banners/${id}`);
  return data.banner;
};
