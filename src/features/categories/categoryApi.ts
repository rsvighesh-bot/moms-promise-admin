import { api } from "../../lib/api";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  status: "active" | "inactive";
}

// Shape comes straight from mongoose-paginate-v2 — don't rename these keys
export interface CategoryListResponse {
  docs: Category[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CategoryFilters {
  search?: string;
  status?: string;
}

export const fetchCategories = async (
  filters: CategoryFilters,
  page: number,
): Promise<CategoryListResponse> => {
  const { data } = await api.get("/categories/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

// use for sub category
export const fetchActiveCategories = async (): Promise<Category[]> => {
  const { data } = await api.get("/categories");
  return data.categories;
};

export type CategoryInput = Pick<
  Category,
  "name" | "imageUrl" | "sortOrder" | "status"
>;

export const createCategory = async (
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await api.post("/categories", input);
  return data.category;
};

export const updateCategory = async (
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> => {
  const { data } = await api.put(`/categories/${id}`, input);
  return data.category;
};

// Soft delete on the backend (sets status: "inactive"), but we still
// invalidate the list query the same way — the row just won't show up
// if the table's filtered to status=active.
export const deleteCategory = async (id: string): Promise<Category> => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.category;
};
