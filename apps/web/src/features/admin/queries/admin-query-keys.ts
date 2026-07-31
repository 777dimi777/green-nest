const resource = (name: string) => ({
  all: ["admin", name] as const,
  lists: () => ["admin", name, "list"] as const,
  list: (query: object) => ["admin", name, "list", query] as const,
  details: () => ["admin", name, "detail"] as const,
  detail: (id: string) => ["admin", name, "detail", id] as const,
});
export const adminQueryKeys = {
  all: ["admin"] as const,
  analytics: ["admin", "analytics"] as const,
  products: resource("products"),
  categories: resource("categories"),
  orders: resource("orders"),
  payments: resource("payments"),
  coupons: resource("coupons"),
  users: resource("users"),
  notifications: resource("notifications"),
};
