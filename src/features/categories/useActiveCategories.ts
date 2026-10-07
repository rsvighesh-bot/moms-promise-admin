import { useQuery } from "@tanstack/react-query";
import { fetchActiveCategories } from "./categoryApi";

export function useActiveCategories() {
  return useQuery({
    queryKey: ["categories", "active-options"],
    queryFn: fetchActiveCategories,
    staleTime: 5 * 60_000, // rarely changes mid-session
  });
}
