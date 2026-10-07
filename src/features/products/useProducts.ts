import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductById,
  type ProductFilters,
  type ProductInput,
} from "./productApi";

const KEY = "products";

export function useProductsList(filters: ProductFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchProductsAdmin(filters, page),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      updateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
