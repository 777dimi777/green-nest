import type { Category } from "./category";
export interface ProductImage { id: string; url: string; alt: string | null; isPrimary: boolean; productId: string; createdAt: string; }
export interface Product {
  id: string; name: string; slug: string; description: string; sku: string; price: string;
  discountPrice: string | null; stock: number; featured: boolean; published: boolean;
  categoryId: string; category: Pick<Category, "id" | "name" | "slug">; images: ProductImage[];
  createdAt: string; updatedAt: string;
}
