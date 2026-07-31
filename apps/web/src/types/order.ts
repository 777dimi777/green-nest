import type { CategorySummary } from "./category";
import type { ProductImage } from "./product";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CARD" | "CASH_ON_DELIVERY";
export interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: ProductImage[];
    category: CategorySummary;
  };
}
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    city: string;
    postalCode: string;
    street: string;
    streetNumber: string;
    apartment: string | null;
  };
  subtotal: number;
  shippingPrice: number;
  discount: number;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
export interface CreateOrderRequest {
  confirm: true;
  addressId: string;
  couponCode?: string;
}
export interface Payment {
  id: string;
  method: PaymentMethod;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  amount: number | string;
  currency: string;
  provider: string;
  providerTransactionId: string | null;
  failureReason: string | null;
  paidAt: string | null;
  orderId: string;
  createdAt: string;
}
