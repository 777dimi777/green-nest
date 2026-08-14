"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  FileBadge,
  FolderTree,
  Menu,
  Package,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { cn } from "@/lib/utils/cn";

const links = [
  ["/admin", BarChart3, "Pregled"],
  ["/admin/proizvodi", Boxes, "Proizvodi"],
  ["/admin/kategorije", FolderTree, "Kategorije"],
  ["/admin/porudzbine", Package, "Porudžbine"],
  ["/admin/placanja", CreditCard, "Plaćanja"],
  ["/admin/kuponi", FileBadge, "Kuponi"],
  ["/admin/korisnici", UsersRound, "Korisnici"],
  ["/admin/notifikacije", Bell, "Notifikacije"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const nav = (
    <nav className="space-y-1" aria-label="Admin navigacija">
      {links.map(([href, Icon, label]) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
            path === href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r bg-card p-5 lg:block">
        <Brand />
        <div className="mt-8">{nav}</div>
      </aside>
      <div>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="lg:hidden"
                  aria-label="Otvori admin navigaciju"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle>Administracija</SheetTitle>
                <SheetDescription className="sr-only">
                  Admin navigacija
                </SheetDescription>
                <div className="mt-8">{nav}</div>
              </SheetContent>
            </Sheet>
            <span className="text-sm text-muted-foreground">
              Admin / {links.find(([href]) => href === path)?.[2] ?? "Detalji"}
            </span>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </header>
        <main id="main-content" className="p-4 sm:p-6 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
function Brand() {
  return <Logo />;
}
