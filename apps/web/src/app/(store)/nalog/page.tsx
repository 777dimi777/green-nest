"use client";

import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <PageContainer className="py-16 sm:py-20">
        <p className="text-sm font-medium text-primary">
          Vaš Green Nest prostor
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold">Moj nalog</h1>
        {user && (
          <Card className="mt-8 max-w-2xl">
            <CardHeader>
              <CardTitle>Podaci naloga</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <UserRound className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ime i prezime
                  </p>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-5 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="truncate font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tip naloga</p>
                  <p className="font-medium">
                    {user.role === "ADMIN" ? "Administrator" : "Kupac"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
</PageContainer>
    </ProtectedRoute>
  );
}
