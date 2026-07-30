import type { ProductListItem } from "./product";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: ProductListItem;
}

export interface WishlistResponse {
  data: WishlistItem[];
  total: number;
}
