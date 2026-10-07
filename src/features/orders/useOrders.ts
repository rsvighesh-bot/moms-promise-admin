import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrdersAdmin,
  fetchOrderByNumberAdmin,
  updateOrderStatus,
  packOrder,
  approveReturn,
  rejectReturn,
  markReturned,
  markRefunded,
  type OrderFilters,
  type OrderStatus,
} from "./orderApi";

const KEY = "orders";

export function useOrdersList(filters: OrderFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchOrdersAdmin(filters, page),
  });
}

export function useOrder(orderNumber: string) {
  return useQuery({
    queryKey: [KEY, orderNumber],
    queryFn: () => fetchOrderByNumberAdmin(orderNumber),
    enabled: !!orderNumber,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      status,
      note,
    }: {
      orderNumber: string;
      status: OrderStatus;
      note?: string;
    }) => updateOrderStatus(orderNumber, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePackOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      note,
    }: {
      orderNumber: string;
      note?: string;
    }) => packOrder(orderNumber, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useApproveReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      note,
    }: {
      orderNumber: string;
      note?: string;
    }) => approveReturn(orderNumber, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRejectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      reason,
    }: {
      orderNumber: string;
      reason: string;
    }) => rejectReturn(orderNumber, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useMarkReturned() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      note,
    }: {
      orderNumber: string;
      note?: string;
    }) => markReturned(orderNumber, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useMarkRefunded() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNumber,
      note,
    }: {
      orderNumber: string;
      note?: string;
    }) => markRefunded(orderNumber, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
