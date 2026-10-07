import { api } from "../../lib/api";

export type ProductStatus = "active" | "draft" | "out_of_stock";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  categoryId: string;
  subCategoryId: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  videos: string[];
  mrp: number; // paise
  sellingPrice: number; // paise
  discountPercent: number;
  ageRange: string[]; // auto-derived from variants — never sent by the form
  attributes: Record<string, unknown>;
  sizeSpecification?: string;
  washCare?: string;
  status: ProductStatus;
  ratingAvg: number;
  ratingCount: number;
}

export interface ProductListResponse {
  docs: ProductListItem[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  status?: string;
  categoryId?: string;
  subCategoryId?: string;
}

export const fetchProductsAdmin = async (
  filters: ProductFilters,
  page: number,
): Promise<ProductListResponse> => {
  const { data } = await api.get("/products/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/products/admin/${id}`);
  return data.product;
};

// Payload sent to the API — money already converted to paise by the caller
export interface ProductInput {
  name: string;
  sku: string;
  brand?: string;
  categoryId: string;
  subCategoryId: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  mrp: number;
  sellingPrice: number;
  sizeSpecification?: string;
  washCare?: string;
  status?: ProductStatus; // only accepted on update, not create
}

export interface ProductListItem extends Omit<
  Product,
  "categoryId" | "subCategoryId"
> {
  categoryId: { _id: string; name: string } | null;
  subCategoryId: { _id: string; name: string } | null;
}

export const createProduct = async (
  input: Omit<ProductInput, "status">,
): Promise<Product> => {
  const { data } = await api.post("/products", input);
  return data.product;
};

export const updateProduct = async (
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, input);
  return data.product;
};

// Soft delete — backend sets status back to "draft", unpublishing it
export const deleteProduct = async (id: string): Promise<Product> => {
  const { data } = await api.delete(`/products/${id}`);
  return data.product;
};
