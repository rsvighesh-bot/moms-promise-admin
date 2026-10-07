import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchVariantsAdmin,
  createVariant,
  updateVariant,
  deleteVariant,
  type VariantInput,
} from "./variantApi";

const KEY = "variants";

export function useVariantsList(productId: string, status: string) {
  return useQuery({
    queryKey: [KEY, productId, status],
    queryFn: () => fetchVariantsAdmin(productId, status),
    enabled: !!productId,
  });
}

export function useCreateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVariant,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<VariantInput> }) =>
      updateVariant(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
