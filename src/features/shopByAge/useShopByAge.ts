import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchShopByAgeAdmin,
  fetchShopByAgeOptions,
  createShopByAge,
  updateShopByAge,
  deleteShopByAge,
  type ShopByAgeFilters,
  type ShopByAgeInput,
} from "./shopByAgeApi";

const KEY = "shop-by-age";

export function useShopByAgeList(filters: ShopByAgeFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchShopByAgeAdmin(filters, page),
  });
}

// Full option list for the variant "Age" dropdown — rarely changes mid-session.
export function useShopByAgeOptions() {
  return useQuery({
    queryKey: [KEY, "options"],
    queryFn: fetchShopByAgeOptions,
    staleTime: 5 * 60_000,
  });
}

export function useCreateShopByAge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createShopByAge,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateShopByAge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ShopByAgeInput>;
    }) => updateShopByAge(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteShopByAge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShopByAge,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
