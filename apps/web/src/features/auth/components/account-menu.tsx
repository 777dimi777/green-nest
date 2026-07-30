"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMediaUrl } from "@/lib/utils/media";
import { useAuth } from "../hooks/use-auth";

export function AccountMenu() {
  const { user, isInitializing, logout } = useAuth();
  const router = useRouter();

  if (isInitializing) {
    return (
      <span
        className="size-10 animate-pulse rounded-full bg-muted"
        aria-label="Provera korisničkog naloga"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent sm:inline-flex"
      >
        <UserRound className="size-4" />
        <span className="hidden lg:inline">Prijavi se</span>
      </Link>
    );
  }

  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const avatarUrl = getMediaUrl(user.avatar);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Uspešno ste se odjavili.");
    } catch {
      toast.success("Odjavljeni ste sa ovog uređaja.");
    }
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 rounded-full px-1.5 pr-2"
          aria-label="Otvori korisnički meni"
        >
          <Avatar className="size-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm lg:inline">
            {user.firstName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="border-b px-3 py-2">
          <p className="truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/nalog">
            <UserRound /> Moj nalog
          </Link>
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard /> Admin kontrolna tabla
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={() => void handleLogout()}
          className="text-destructive"
        >
          <LogOut /> Odjava
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
