import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchShipmentByOrderId,
  createShipment,
  syncShipmentStatus,
  createReturn,
  fetchOrderShippingRate,
  createPickupRequest,
} from "./shippingApi";

const shipmentKey = (orderId: string) => ["shipment", orderId];

export function useShipment(orderId: string) {
  return useQuery({
    queryKey: shipmentKey(orderId),
    queryFn: () => fetchShipmentByOrderId(orderId),
    enabled: !!orderId,
  });
}

export function useCreateShipment(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { orderNumber: string; weight: number }) =>
      createShipment(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shipmentKey(orderId) });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSyncShipment(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (awbNumber: string) => syncShipmentStatus(awbNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shipmentKey(orderId) });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCreateReturn(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderNumber: string) => createReturn(orderNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shipmentKey(orderId) });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOrderShippingRate(orderNumber: string, weight: number) {
  return useQuery({
    queryKey: ["shipping-rate", orderNumber, weight],
    queryFn: () => fetchOrderShippingRate(orderNumber, weight),
    enabled: !!orderNumber && weight > 0,
    staleTime: 5 * 60_000, // rate won't change in 5 min
  });
}

export function useCreatePickupRequest() {
  return useMutation({
    mutationFn: createPickupRequest,
  });
}
