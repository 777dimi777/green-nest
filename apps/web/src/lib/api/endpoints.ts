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
  admin: {
    analytics: {
      overview: "/analytics/overview",
      revenue: "/analytics/revenue-series",
      users: "/analytics/users-series",
      orders: "/analytics/orders-by-status",
      payments: "/analytics/payments",
    },
    products: {
      root: "/products/admin/all",
      detail: (id:string)=>`/products/admin/${encodeURIComponent(id)}`,
      item: (id:string)=>`/products/${encodeURIComponent(id)}`,
      publish: (id:string)=>`/products/${encodeURIComponent(id)}/publish`,
      stock: (id:string)=>`/products/${encodeURIComponent(id)}/stock`,
      images: (id:string)=>`/products/${encodeURIComponent(id)}/images`,
      image: (productId:string,imageId:string)=>`/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
      primaryImage: (productId:string,imageId:string)=>`/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}/primary`,
    },
    categories: { root:"/categories",detail:(id:string)=>`/categories/admin/${encodeURIComponent(id)}`,item:(id:string)=>`/categories/${encodeURIComponent(id)}` },
    orders: {
      root:"/orders/admin/all",
      item:(id:string)=>`/orders/admin/${encodeURIComponent(id)}`,
      status:(id:string)=>`/orders/admin/${encodeURIComponent(id)}/status`,
      cancel:(id:string)=>`/orders/admin/${encodeURIComponent(id)}/cancel`,
    },
    payments: { root:"/payments",item:(id:string)=>`/payments/${encodeURIComponent(id)}`,status:(id:string)=>`/payments/${encodeURIComponent(id)}/status` },
    coupons: { root:"/coupons/admin/all",create:"/coupons",item:(id:string)=>`/coupons/${encodeURIComponent(id)}` },
    users: { root:"/users",item:(id:string)=>`/users/${encodeURIComponent(id)}`,role:(id:string)=>`/users/${encodeURIComponent(id)}/role` },
    notifications: { root:"/notifications/admin/all",item:(id:string)=>`/notifications/admin/${encodeURIComponent(id)}` },
  },
} as const;
