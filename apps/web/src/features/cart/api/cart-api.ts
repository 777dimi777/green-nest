import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AddCartItemRequest,
  Cart,
  UpdateCartItemRequest,
} from "@/types/cart";

interface CartMutationResponse {
  message: string;
  data: Cart;
}
export const cartApi = {
  get: async () => (await apiClient.get<Cart>(API_ENDPOINTS.cart.root)).data,
  add: async (payload: AddCartItemRequest) =>
    (
      await apiClient.post<CartMutationResponse>(
        API_ENDPOINTS.cart.items,
        payload,
      )
    ).data,
  update: async ({ productId, quantity }: UpdateCartItemRequest) =>
    (
      await apiClient.patch<CartMutationResponse>(
        API_ENDPOINTS.cart.item(productId),
        { quantity },
      )
    ).data,
  remove: async (productId: string) =>
    (
      await apiClient.delete<CartMutationResponse>(
        API_ENDPOINTS.cart.item(productId),
      )
    ).data,
  clear: async () => (await apiClient.delete(API_ENDPOINTS.cart.root)).data,
};
