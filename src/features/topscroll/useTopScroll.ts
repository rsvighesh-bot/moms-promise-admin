import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTopScrollAdmin, updateTopScroll } from "./topScrollApi";

const KEY = ["topScroll", "admin"];

export function useTopScroll() {
  return useQuery({ queryKey: KEY, queryFn: fetchTopScrollAdmin });
}

export function useUpdateTopScroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTopScroll,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
