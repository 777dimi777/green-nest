import type { CategorySummary } from "./category";

export type DecimalValue = number | string;

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  productId: string;
  createdAt: string;
}

interface ProductBase {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: DecimalValue;
  discountPrice: DecimalValue | null;
  stock: number;
  latinName: string;
  plantType: string;
  height: string | null;
  trunkCircumference: string | null;
  graftHeight: string | null;
  potDiameter: string | null;
  featured: boolean;
  published: boolean;
  categoryId: string;
  category: CategorySummary;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem extends ProductBase {
  _count: {
    reviews: number;
  };
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ProductDetails extends ProductBase {
  reviews: ProductReview[];
}

export type Product = ProductListItem;

export interface ProductsQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  sortBy?: "createdAt" | "name" | "price" | "stock";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminProductsQuery extends ProductsQuery {
  published?: boolean;
}
