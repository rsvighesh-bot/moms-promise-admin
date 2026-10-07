import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchKpiImagesAdmin,
  createKpiImage,
  updateKpiImage,
  deleteKpiImage,
  type KpiImageFilters,
  type KpiImageInput,
} from "./kpiImageApi";

const KEY = "kpi-images";

export function useKpiImagesList(filters: KpiImageFilters, page: number) {
  return useQuery({
    queryKey: [KEY, filters, page],
    queryFn: () => fetchKpiImagesAdmin(filters, page),
  });
}

export function useCreateKpiImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createKpiImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateKpiImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<KpiImageInput>;
    }) => updateKpiImage(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteKpiImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteKpiImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
