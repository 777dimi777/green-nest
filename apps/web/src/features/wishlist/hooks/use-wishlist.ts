"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { wishlistApi } from "../api/wishlist-api";
import { wishlistQueryKeys } from "../queries/wishlist-query-keys";

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: wishlistQueryKeys.all, queryFn: wishlistApi.get, enabled: isAuthenticated });
}
export function useAddToWishlist() {
  const client = useQueryClient();
  return useMutation({ mutationFn: wishlistApi.add, onSuccess: async () => { toast.success("Proizvod je dodat u listu želja."); await client.invalidateQueries({queryKey:wishlistQueryKeys.all}); }, onError: e => toast.error(getApiErrorMessage(e)) });
}
export function useRemoveFromWishlist() {
  const client = useQueryClient();
  return useMutation({ mutationFn: wishlistApi.remove, onSuccess: async () => { toast.success("Proizvod je uklonjen iz liste želja."); await client.invalidateQueries({queryKey:wishlistQueryKeys.all}); }, onError: e => toast.error(getApiErrorMessage(e)) });
}
