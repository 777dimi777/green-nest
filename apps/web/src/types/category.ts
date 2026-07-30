export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface Category extends CategorySummary {
  description: string | null;
  image: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: CategorySummary[];
  _count: {
    products: number;
  };
}
