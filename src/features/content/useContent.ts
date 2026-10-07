import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchShippingReturn,
  updateShippingReturn,
  fetchTerms,
  updateTerms,
} from "./contentApi";

const SHIPPING_KEY = ["content", "shipping-return"];
const TERMS_KEY = ["content", "terms"];

export function useShippingReturn() {
  return useQuery({ queryKey: SHIPPING_KEY, queryFn: fetchShippingReturn });
}

export function useUpdateShippingReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateShippingReturn,
    onSuccess: () => qc.invalidateQueries({ queryKey: SHIPPING_KEY }),
  });
}

export function useTerms() {
  return useQuery({ queryKey: TERMS_KEY, queryFn: fetchTerms });
}

export function useUpdateTerms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTerms,
    onSuccess: () => qc.invalidateQueries({ queryKey: TERMS_KEY }),
  });
}
