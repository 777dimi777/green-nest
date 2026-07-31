"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { CreateReviewRequest, UpdateReviewRequest } from "@/types/review";
import { reviewsApi } from "../api/reviews-api";
import { reviewQueryKeys } from "../queries/review-query-keys";
import { productQueryKeys } from "@/features/products/queries/product-query-keys";

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: reviewQueryKeys.product(productId),
    queryFn: () => reviewsApi.getProduct(productId),
  });
}
export function useMyReview(productId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: reviewQueryKeys.my(productId),
    queryFn: () => reviewsApi.getMy(productId),
    enabled: isAuthenticated,
  });
}
function useReviewMutation<T>(
  fn: (value: T) => Promise<unknown>,
  productId: string,
  message: string,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      toast.success(message);
      await Promise.all([
        client.invalidateQueries({
          queryKey: reviewQueryKeys.product(productId),
        }),
        client.invalidateQueries({ queryKey: reviewQueryKeys.my(productId) }),
        client.invalidateQueries({ queryKey: productQueryKeys.details() }),
      ]);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useCreateReview(productId: string) {
  return useReviewMutation<CreateReviewRequest>(
    (p) => reviewsApi.create(productId, p),
    productId,
    "Recenzija je objavljena.",
  );
}
export function useUpdateReview(productId: string, reviewId: string) {
  return useReviewMutation<UpdateReviewRequest>(
    (p) => reviewsApi.update(reviewId, p),
    productId,
    "Recenzija je izmenjena.",
  );
}
export function useDeleteReview(productId: string) {
  return useReviewMutation<string>(
    reviewsApi.remove,
    productId,
    "Recenzija je obrisana.",
  );
}
