export const reviewQueryKeys = {
  all: ["reviews"] as const,
  product: (productId: string) => ["reviews", "product", productId] as const,
  my: (productId: string) => ["reviews", "my", productId] as const,
};
