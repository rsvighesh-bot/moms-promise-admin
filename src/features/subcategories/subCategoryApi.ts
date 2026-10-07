import { api } from "../../lib/api";

export interface SubCategory {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export const fetchSubCategories = async (
  categoryId: string,
  status: string,
): Promise<SubCategory[]> => {
  if (!categoryId) return [];
  const { data } = await api.get("/subcategories/admin", {
    params: { categoryId, status },
  });
  return data.subCategories;
};

export const createSubCategory = async (input: {
  categoryId: string;
  name: string;
}): Promise<SubCategory> => {
  const { data } = await api.post("/subcategories", input);
  return data.subCategory;
};

export const updateSubCategory = async (
  id: string,
  input: { name?: string; status?: "active" | "inactive" },
): Promise<SubCategory> => {
  const { data } = await api.put(`/subcategories/${id}`, input);
  return data.subCategory;
};

// Soft delete on the backend — same pattern as categories
export const deleteSubCategory = async (id: string): Promise<SubCategory> => {
  const { data } = await api.delete(`/subcategories/${id}`);
  return data.subCategory;
};
