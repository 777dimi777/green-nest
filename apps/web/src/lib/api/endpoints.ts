export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  products: {
    root: "/products",
    bySlug: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  },
  categories: {
    root: "/categories",
    bySlug: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  },
  health: "/health",
} as const;
