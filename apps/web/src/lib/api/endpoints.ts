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
  addresses: {
    root: "/addresses",
    item: (id: string) => `/addresses/${encodeURIComponent(id)}`,
  },
  orders: {
    root: "/orders",
    mine: "/orders/my",
    myOrder: (id: string) => `/orders/my/${encodeURIComponent(id)}`,
    cancel: (id: string) => `/orders/my/${encodeURIComponent(id)}/cancel`,
  },
  payments: {
    forOrder: (orderId: string) => `/payments/orders/${encodeURIComponent(orderId)}`,
    mine: "/payments/my",
  },
  notifications: {
    mine: "/notifications/my",
    unreadCount: "/notifications/my/unread-count",
    readAll: "/notifications/my/read-all",
    read: (id: string) => `/notifications/my/${encodeURIComponent(id)}/read`,
    item: (id: string) => `/notifications/my/${encodeURIComponent(id)}`,
  },
  health: "/health",
} as const;
