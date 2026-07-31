"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { addressesApi } from "../api/addresses-api";
import { addressQueryKeys } from "../queries/address-query-keys";
const err = (e: Error) => toast.error(getApiErrorMessage(e));
export function useAddresses() {
  return useQuery({
    queryKey: addressQueryKeys.all,
    queryFn: addressesApi.get,
  });
}
function useAddressMutation<T>(fn: (v: T) => Promise<unknown>, msg: string) {
  const c = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      toast.success(msg);
      await c.invalidateQueries({ queryKey: addressQueryKeys.all });
    },
    onError: err,
  });
}
export function useCreateAddress() {
  return useAddressMutation(addressesApi.create, "Adresa je dodata.");
}
export function useUpdateAddress() {
  return useAddressMutation(addressesApi.update, "Adresa je izmenjena.");
}
export function useRemoveAddress() {
  return useAddressMutation(addressesApi.remove, "Adresa je obrisana.");
}
