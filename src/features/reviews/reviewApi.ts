import { api } from "../../lib/api";

export interface Review {
  _id: string;
  customerName: string;
  customerImage?: string;
  rating: number;
  reviewText: string;
  sortOrder: number;
  status: "active" | "inactive";
}

export interface ReviewListResponse {
  docs: Review[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface ReviewFilters {
  status?: string;
}

export const fetchReviewsAdmin = async (
  filters: ReviewFilters,
  page: number,
): Promise<ReviewListResponse> => {
  const { data } = await api.get("/reviews/admin", {
    params: { ...filters, page, limit: 10 },
  });
  return data;
};

export type ReviewInput = Pick<
  Review,
  "customerName" | "customerImage" | "rating" | "reviewText" | "sortOrder" | "status"
>;

export const createReview = async (
  input: Omit<ReviewInput, "status">,
): Promise<Review> => {
  const { data } = await api.post("/reviews", input);
  return data.review;
};

export const updateReview = async (
  id: string,
  input: Partial<ReviewInput>,
): Promise<Review> => {
  const { data } = await api.put(`/reviews/${id}`, input);
  return data.review;
};

// Soft delete — backend sets status to "inactive"
export const deleteReview = async (id: string): Promise<Review> => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data.review;
};
