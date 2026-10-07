import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchShopVideosAdmin,
  createShopVideo,
  updateShopVideo,
  deleteShopVideo,
  type ShopVideoFilters,
  type ShopVideoInput,
} from "./shopVideoApi";

const KEY = "shop-videos";

export function useShopVideosList(filters: ShopVideoFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchShopVideosAdmin(filters, page),
  });
}

export function useCreateShopVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createShopVideo,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateShopVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ShopVideoInput>;
    }) => updateShopVideo(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteShopVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShopVideo,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
