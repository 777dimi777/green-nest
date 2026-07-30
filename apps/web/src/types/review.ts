export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string; lastName: string };
}
export interface ReviewsResponse {
  data: Review[];
  summary: { averageRating: number; totalReviews: number };
}
export interface MyReviewResponse { hasReviewed: boolean; review: Review | null }
export interface CreateReviewRequest { rating: number; title?: string; comment: string }
export type UpdateReviewRequest = Partial<CreateReviewRequest>;
