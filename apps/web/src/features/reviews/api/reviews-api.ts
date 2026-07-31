import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreateReviewRequest,
  MyReviewResponse,
  ReviewsResponse,
  UpdateReviewRequest,
} from "@/types/review";

export const reviewsApi = {
  getProduct: async (productId: string) =>
    (
      await apiClient.get<ReviewsResponse>(
        API_ENDPOINTS.reviews.product(productId),
      )
    ).data,
  getMy: async (productId: string) =>
    (
      await apiClient.get<MyReviewResponse>(
        API_ENDPOINTS.reviews.myReview(productId),
      )
    ).data,
  create: async (productId: string, payload: CreateReviewRequest) =>
    (await apiClient.post(API_ENDPOINTS.reviews.product(productId), payload))
      .data,
  update: async (reviewId: string, payload: UpdateReviewRequest) =>
    (await apiClient.patch(API_ENDPOINTS.reviews.item(reviewId), payload)).data,
  remove: async (reviewId: string) =>
    (await apiClient.delete(API_ENDPOINTS.reviews.item(reviewId))).data,
};
