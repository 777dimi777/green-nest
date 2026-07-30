"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cartApi } from "../api/cart-api";
import { cartQueryKeys } from "../queries/cart-query-keys";

const error = (e: Error) => toast.error(getApiErrorMessage(e));
export function useCart() {
  const { isAuthenticated } = useAuth();
  return useQuery({queryKey:cartQueryKeys.all,queryFn:cartApi.get,enabled:isAuthenticated});
}
function useCartMutation<T>(mutationFn:(value:T)=>Promise<unknown>, message:string) {
  const client=useQueryClient();
  return useMutation({mutationFn,onSuccess:async()=>{toast.success(message);await client.invalidateQueries({queryKey:cartQueryKeys.all});},onError:error});
}
export function useAddToCart(){return useCartMutation(cartApi.add,"Proizvod je dodat u korpu.");}
export function useUpdateCartItem(){return useCartMutation(cartApi.update,"Količina je ažurirana.");}
export function useRemoveCartItem(){return useCartMutation(cartApi.remove,"Proizvod je uklonjen iz korpe.");}
export function useClearCart(){return useCartMutation<void>(()=>cartApi.clear(),"Korpa je ispražnjena.");}
