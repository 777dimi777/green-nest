import type { PaginatedResponse } from "./api";
export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "GENERAL";
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  orderId: string | null;
  paymentId: string | null;
  createdAt: string;
  readAt: string | null;
}
export type NotificationsResponse = PaginatedResponse<Notification>;
