import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  type BannerFilters,
  type BannerInput,
} from "./bannerApi";

const KEY = "banners";

export function useBannersList(filters: BannerFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchBannersAdmin(filters, page),
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BannerInput> }) =>
      updateBanner(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
