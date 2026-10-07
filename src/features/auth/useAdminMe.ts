import { useQuery } from "@tanstack/react-query";
import { fetchAdminMe } from "./authApi";

export const ADMIN_ME_KEY = ["admin", "me"] as const;

export function useAdminMe() {
  return useQuery({
    queryKey: ADMIN_ME_KEY,
    queryFn: fetchAdminMe,
    retry: false, // a 401 means "not logged in", not "try again"
    staleTime: 5 * 60_000, // session rarely changes; no need to refetch constantly
  });
}
