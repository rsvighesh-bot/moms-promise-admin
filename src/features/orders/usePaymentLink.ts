import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentLink, createManualOrder } from "./paymentLinkApi";

export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPaymentLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCreateManualOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createManualOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
