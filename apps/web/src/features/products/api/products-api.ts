import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/api";
import type {
  ProductDetails,
  ProductListItem,
  ProductsQuery,
} from "@/types/product";

function compactParams(query: ProductsQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => {
      return value !== undefined && value !== "";
    }),
  );
}

export const productsApi = {
  async getProducts(query: ProductsQuery = {}) {
    const response = await apiClient.get<PaginatedResponse<ProductListItem>>(
      API_ENDPOINTS.products.root,
      { params: compactParams(query) },
    );
    return response.data;
  },
  async getProductDetails(slug: string) {
    const response = await apiClient.get<ProductDetails>(
      API_ENDPOINTS.products.bySlug(slug),
    );
    return response.data;
  },
};
