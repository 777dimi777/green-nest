import type { CategorySummary } from "./category";
import type { ProductImage, DecimalValue } from "./product";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: DecimalValue;
  discountPrice: DecimalValue | null;
  stock: number;
  published: boolean;
  category: CategorySummary;
  images: ProductImage[];
}
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  available: boolean;
  exceedsStock: boolean;
  product: CartProduct;
}
export interface Cart {
  id: string | null;
  items: CartItem[];
  summary: { totalItems: number; uniqueItems: number; subtotal: number };
}
export interface AddCartItemRequest { productId: string; quantity: number }
export interface UpdateCartItemRequest { productId: string; quantity: number }
