"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAuth } from "../hooks/use-auth";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    if (!user) router.replace("/auth/login?redirect=%2Fadmin");
    else if (user.role !== "ADMIN") router.replace("/zabranjen-pristup");
  }, [isInitializing, router, user]);

  if (isInitializing || !user || user.role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingSpinner label="Provera administratorskog pristupa" />
      </div>
    );
  }
  return children;
}
