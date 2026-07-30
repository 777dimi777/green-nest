"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAuth } from "../hooks/use-auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isInitializing, pathname, router]);

  if (isInitializing || !isAuthenticated) {
    return <div className="grid min-h-[50vh] place-items-center"><LoadingSpinner label="Provera prijave" /></div>;
  }
  return children;
}
