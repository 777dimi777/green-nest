import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { NotificationsResponse } from "@/types/notification";
export const notificationsApi = {
  get: async () =>
    (
      await apiClient.get<NotificationsResponse>(
        API_ENDPOINTS.notifications.mine,
        { params: { limit: 20 } },
      )
    ).data,
  unread: async () =>
    (
      await apiClient.get<{ unreadCount: number }>(
        API_ENDPOINTS.notifications.unreadCount,
      )
    ).data,
  read: async (id: string) =>
    (await apiClient.patch(API_ENDPOINTS.notifications.read(id))).data,
  readAll: async () =>
    (await apiClient.patch(API_ENDPOINTS.notifications.readAll)).data,
};
