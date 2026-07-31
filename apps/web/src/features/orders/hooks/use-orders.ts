"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cartQueryKeys } from "@/features/cart/queries/cart-query-keys";
import { notificationQueryKeys } from "@/features/notifications/queries/notification-query-keys";
import { ordersApi } from "../api/orders-api";
import { orderQueryKeys } from "../queries/order-query-keys";
export function useOrders() {
  return useQuery({
    queryKey: orderQueryKeys.list,
    queryFn: ordersApi.getMine,
  });
}
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderQueryKeys.detail(id),
    queryFn: () => ordersApi.getOne(id),
    enabled: !!id,
  });
}
function useOrderMutation<T, R>(fn: (v: T) => Promise<R>, msg: string) {
  const c = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      toast.success(msg);
      await Promise.all([
        c.invalidateQueries({ queryKey: orderQueryKeys.all }),
        c.invalidateQueries({ queryKey: cartQueryKeys.all }),
        c.invalidateQueries({ queryKey: notificationQueryKeys.all }),
      ]);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useCreateOrder() {
  return useOrderMutation(ordersApi.create, "Porudžbina je kreirana.");
}
export function useCancelOrder() {
  return useOrderMutation(ordersApi.cancel, "Porudžbina je otkazana.");
}
export function useCreatePayment() {
  return useOrderMutation(ordersApi.pay, "Plaćanje je obrađeno.");
}
