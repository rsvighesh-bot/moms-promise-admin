import { api } from "../../lib/api";

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin";
}

export const loginAdmin = async (
  email: string,
  password: string,
): Promise<Admin> => {
  const { data } = await api.post("/admin/auth/login", { email, password });
  return data.admin;
};

export const logoutAdmin = async (): Promise<void> => {
  await api.post("/admin/auth/logout");
};

export const fetchAdminMe = async (): Promise<Admin> => {
  const { data } = await api.get("/admin/auth/me");
  return data.admin;
};
