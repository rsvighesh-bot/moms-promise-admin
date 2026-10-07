import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchComboOffersAdmin,
  createComboOffer,
  updateComboOffer,
  deleteComboOffer,
  type ComboOfferFilters,
  type ComboOfferInput,
} from "./comboOfferApi";

const KEY = "combo-offers";

export function useComboOffersList(filters: ComboOfferFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchComboOffersAdmin(filters, page),
  });
}

export function useCreateComboOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createComboOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateComboOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ComboOfferInput>;
    }) => updateComboOffer(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteComboOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComboOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
