import { api } from "../../lib/api";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  status: "active" | "blocked";
  createdAt: string;
}

export const changePassword = async (input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await api.put("/admin/auth/change-password", input);
};

export const fetchAdmins = async (): Promise<AdminUser[]> => {
  const { data } = await api.get("/admin/auth/admins");
  return data.admins;
};

export const createAdmin = async (input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "superadmin";
}): Promise<AdminUser> => {
  const { data } = await api.post("/admin/auth/admins", input);
  return data.admin;
};

export const toggleAdminStatus = async (id: string): Promise<AdminUser> => {
  const { data } = await api.patch(`/admin/auth/admins/${id}/toggle-status`);
  return data.admin;
};
