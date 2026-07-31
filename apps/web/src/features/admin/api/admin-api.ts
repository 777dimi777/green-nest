import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminCategoryDetails, Category } from "@/types/category";
import type {
  AdminProductsQuery,
  ProductDetails,
  ProductListItem,
} from "@/types/product";
import type {
  AdminCouponQuery,
  AdminList,
  AdminNotification,
  AdminNotificationQuery,
  AdminOrder,
  AdminOrderQuery,
  AdminOrderSummary,
  AdminPayment,
  AdminPaymentQuery,
  AdminUser,
  AdminUserDetails,
  AdminUserQuery,
  AnalyticsOverview,
  Coupon,
  CouponRequest,
  OrdersAnalytics,
  PaymentAnalytics,
  RevenueSeries,
  UsersSeries,
} from "@/types/admin";
const compact = (query: object) =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
export const adminApi = {
  analytics: {
    overview: async () =>
      (
        await apiClient.get<AnalyticsOverview>(
          API_ENDPOINTS.admin.analytics.overview,
        )
      ).data,
    revenue: async () =>
      (
        await apiClient.get<RevenueSeries>(
          API_ENDPOINTS.admin.analytics.revenue,
        )
      ).data,
    users: async () =>
      (await apiClient.get<UsersSeries>(API_ENDPOINTS.admin.analytics.users))
        .data,
    orders: async () =>
      (
        await apiClient.get<OrdersAnalytics>(
          API_ENDPOINTS.admin.analytics.orders,
        )
      ).data,
    payments: async () =>
      (
        await apiClient.get<PaymentAnalytics>(
          API_ENDPOINTS.admin.analytics.payments,
        )
      ).data,
  },
  products: {
    list: async (query: AdminProductsQuery) =>
      (
        await apiClient.get<AdminList<ProductListItem>>(
          API_ENDPOINTS.admin.products.root,
          { params: compact(query) },
        )
      ).data,
    detail: async (id: string) =>
      (
        await apiClient.get<ProductDetails>(
          API_ENDPOINTS.admin.products.detail(id),
        )
      ).data,
    create: async (payload: object) =>
      (
        await apiClient.post<ProductDetails>(
          API_ENDPOINTS.products.root,
          payload,
        )
      ).data,
    update: async ({ id, payload }: { id: string; payload: object }) =>
      (
        await apiClient.patch<ProductDetails>(
          API_ENDPOINTS.admin.products.item(id),
          payload,
        )
      ).data,
    remove: async (id: string) =>
      (await apiClient.delete(API_ENDPOINTS.admin.products.item(id))).data,
    publish: async ({ id, published }: { id: string; published: boolean }) =>
      (
        await apiClient.patch<ProductDetails>(
          API_ENDPOINTS.admin.products.publish(id),
          { published },
        )
      ).data,
    stock: async ({ id, stock }: { id: string; stock: number }) =>
      (
        await apiClient.patch<ProductDetails>(
          API_ENDPOINTS.admin.products.stock(id),
          { stock },
        )
      ).data,
    upload: async ({
      id,
      file,
      isPrimary,
    }: {
      id: string;
      file: File;
      isPrimary: boolean;
    }) => {
      const data = new FormData();
      data.append("file", file);
      data.append("isPrimary", String(isPrimary));
      return (
        await apiClient.post(API_ENDPOINTS.admin.products.images(id), data)
      ).data;
    },
    removeImage: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) =>
      (
        await apiClient.delete(
          API_ENDPOINTS.admin.products.image(productId, imageId),
        )
      ).data,
    setPrimary: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) =>
      (
        await apiClient.patch(
          API_ENDPOINTS.admin.products.primaryImage(productId, imageId),
        )
      ).data,
  },
  categories: {
    list: async () =>
      (await apiClient.get<Category[]>(API_ENDPOINTS.admin.categories.root))
        .data,
    detail: async (id: string) =>
      (
        await apiClient.get<AdminCategoryDetails>(
          API_ENDPOINTS.admin.categories.detail(id),
        )
      ).data,
    create: async (payload: object) =>
      (
        await apiClient.post<Category>(
          API_ENDPOINTS.admin.categories.root,
          payload,
        )
      ).data,
    update: async ({ id, payload }: { id: string; payload: object }) =>
      (
        await apiClient.patch<Category>(
          API_ENDPOINTS.admin.categories.item(id),
          payload,
        )
      ).data,
    remove: async (id: string) =>
      (await apiClient.delete(API_ENDPOINTS.admin.categories.item(id))).data,
  },
  orders: {
    list: async (query: AdminOrderQuery) =>
      (
        await apiClient.get<AdminList<AdminOrderSummary>>(
          API_ENDPOINTS.admin.orders.root,
          { params: compact(query) },
        )
      ).data,
    detail: async (id: string) =>
      (await apiClient.get<AdminOrder>(API_ENDPOINTS.admin.orders.item(id)))
        .data,
    status: async ({ id, status }: { id: string; status: string }) =>
      (await apiClient.patch(API_ENDPOINTS.admin.orders.status(id), { status }))
        .data,
    cancel: async (id: string) =>
      (await apiClient.patch(API_ENDPOINTS.admin.orders.cancel(id))).data,
  },
  payments: {
    list: async (query: AdminPaymentQuery) =>
      (
        await apiClient.get<AdminList<AdminPayment>>(
          API_ENDPOINTS.admin.payments.root,
          { params: compact(query) },
        )
      ).data,
    detail: async (id: string) =>
      (await apiClient.get<AdminPayment>(API_ENDPOINTS.admin.payments.item(id)))
        .data,
    status: async ({
      id,
      status,
    }: {
      id: string;
      status: AdminPayment["status"];
    }) =>
      (
        await apiClient.patch(API_ENDPOINTS.admin.payments.status(id), {
          status,
        })
      ).data,
  },
  coupons: {
    list: async (query: AdminCouponQuery) =>
      (
        await apiClient.get<AdminList<Coupon>>(
          API_ENDPOINTS.admin.coupons.root,
          { params: compact(query) },
        )
      ).data,
    detail: async (id: string) =>
      (await apiClient.get<Coupon>(API_ENDPOINTS.admin.coupons.item(id))).data,
    create: async (payload: CouponRequest) =>
      (
        await apiClient.post<Coupon>(
          API_ENDPOINTS.admin.coupons.create,
          payload,
        )
      ).data,
    update: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CouponRequest>;
    }) =>
      (
        await apiClient.patch<Coupon>(
          API_ENDPOINTS.admin.coupons.item(id),
          payload,
        )
      ).data,
    remove: async (id: string) =>
      (await apiClient.delete(API_ENDPOINTS.admin.coupons.item(id))).data,
  },
  users: {
    list: async (query: AdminUserQuery) =>
      (
        await apiClient.get<AdminList<AdminUser>>(
          API_ENDPOINTS.admin.users.root,
          { params: compact(query) },
        )
      ).data,
    detail: async (id: string) =>
      (
        await apiClient.get<AdminUserDetails>(
          API_ENDPOINTS.admin.users.item(id),
        )
      ).data,
    role: async ({ id, role }: { id: string; role: AdminUser["role"] }) =>
      (await apiClient.patch(API_ENDPOINTS.admin.users.role(id), { role }))
        .data,
    remove: async (id: string) =>
      (await apiClient.delete(API_ENDPOINTS.admin.users.item(id))).data,
  },
  notifications: {
    list: async (query: AdminNotificationQuery) =>
      (
        await apiClient.get<AdminList<AdminNotification>>(
          API_ENDPOINTS.admin.notifications.root,
          { params: compact(query) },
        )
      ).data,
    detail: async (id: string) =>
      (
        await apiClient.get<AdminNotification>(
          API_ENDPOINTS.admin.notifications.item(id),
        )
      ).data,
  },
};
