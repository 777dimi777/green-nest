export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  users: {
    current: "/users/me",
  },
  products: {
    root: "/products",
    bySlug: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  },
  categories: {
    root: "/categories",
    bySlug: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  },
  wishlist: {
    root: "/wishlist",
    item: (productId: string) => `/wishlist/${encodeURIComponent(productId)}`,
    clear: "/wishlist/clear",
  },
  cart: {
    root: "/cart",
    items: "/cart/items",
    item: (productId: string) => `/cart/items/${encodeURIComponent(productId)}`,
  },
  reviews: {
    product: (productId: string) => `/reviews/product/${encodeURIComponent(productId)}`,
    myReview: (productId: string) => `/reviews/my-review/${encodeURIComponent(productId)}`,
    item: (reviewId: string) => `/reviews/${encodeURIComponent(reviewId)}`,
  },
  health: "/health",
} as const;
