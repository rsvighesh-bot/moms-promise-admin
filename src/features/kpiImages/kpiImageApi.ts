import { api } from "../../lib/api";

export interface KpiImage {
  _id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  sortOrder: number;
  status: "active" | "inactive";
}

export interface KpiImageListResponse {
  docs: KpiImage[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface KpiImageFilters {
  status?: string;
}

export const fetchKpiImagesAdmin = async (
  filters: KpiImageFilters,
  page: number,
): Promise<KpiImageListResponse> => {
  const { data } = await api.get("/kpi-images/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

export type KpiImageInput = Pick<
  KpiImage,
  "imageUrl" | "linkUrl" | "title" | "sortOrder" | "status"
>;

export const createKpiImage = async (
  input: Omit<KpiImageInput, "status">,
): Promise<KpiImage> => {
  const { data } = await api.post("/kpi-images", input);
  return data.image;
};

export const updateKpiImage = async (
  id: string,
  input: Partial<KpiImageInput>,
): Promise<KpiImage> => {
  const { data } = await api.put(`/kpi-images/${id}`, input);
  return data.image;
};

// Soft delete — backend sets status to "inactive"
export const deleteKpiImage = async (id: string): Promise<KpiImage> => {
  const { data } = await api.delete(`/kpi-images/${id}`);
  return data.image;
};
