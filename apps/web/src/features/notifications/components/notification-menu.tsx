"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatDateTime } from "@/lib/utils/date";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "../hooks/use-notifications";
export function NotificationMenu() {
  const { isAuthenticated } = useAuth(),
    q = useNotifications(),
    count = useUnreadCount(),
    read = useMarkNotificationRead(),
    all = useMarkAllRead();
  if (!isAuthenticated) return null;
  const unread = count.data?.unreadCount ?? 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifikacije"
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-[11px] leading-5 text-primary-foreground">
              <span aria-hidden>{unread > 99 ? "99+" : unread}</span>
              <span className="sr-only">
                {unread} nepročitanih notifikacija
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3">
          <strong>Notifikacije</strong>
          {unread > 0 && (
            <button
              className="text-xs text-primary"
              disabled={all.isPending}
              onClick={() => all.mutate()}
            >
              Označi sve pročitano
            </button>
          )}
        </div>
        {q.data?.data.slice(0, 5).map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={!n.read ? "bg-secondary/60" : ""}
            onSelect={() => {
              if (!n.read) read.mutate(n.id);
            }}
          >
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {n.message}
              </p>
              <time className="text-[11px] text-muted-foreground">
                {formatDateTime(n.createdAt)}
              </time>
            </div>
          </DropdownMenuItem>
        ))}
        {!q.isPending && !q.data?.data.length && (
          <p className="p-4 text-sm text-muted-foreground">
            Nema notifikacija.
          </p>
        )}
        <DropdownMenuItem asChild>
          <Link href="/notifikacije" className="justify-center text-primary">
            Sve notifikacije
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
