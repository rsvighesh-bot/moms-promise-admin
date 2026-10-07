import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  fetchAdmins,
  createAdmin,
  toggleAdminStatus,
} from "./settingsApi";

const ADMINS_KEY = ["settings", "admins"];

export function useAdminsList() {
  return useQuery({ queryKey: ADMINS_KEY, queryFn: fetchAdmins });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMINS_KEY }),
  });
}

export function useToggleAdminStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleAdminStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMINS_KEY }),
  });
}
