import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "./subCategoryApi";

const KEY = "subcategories";

export function useSubCategoriesList(categoryId: string, status: string) {
  return useQuery({
    queryKey: [KEY, categoryId, status],
    queryFn: () => fetchSubCategories(categoryId, status),
    enabled: !!categoryId,
  });
}

export function useCreateSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { name?: string; status?: "active" | "inactive" };
    }) => updateSubCategory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSubCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
