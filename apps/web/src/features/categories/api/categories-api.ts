import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { Category } from "@/types/category";

export const categoriesApi = {
  async getCategories() {
    const response = await apiClient.get<Category[]>(
      API_ENDPOINTS.categories.root,
    );
    return response.data;
  },
};
