import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { WishlistResponse } from "@/types/wishlist";

export const wishlistApi = {
  get: async () => (await apiClient.get<WishlistResponse>(API_ENDPOINTS.wishlist.root)).data,
  add: async (productId: string) => (await apiClient.post(API_ENDPOINTS.wishlist.item(productId))).data,
  remove: async (productId: string) => (await apiClient.delete(API_ENDPOINTS.wishlist.item(productId))).data,
};
