import Link from "next/link";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { storeNavigation } from "@/lib/constants/navigation";
import { Logo } from "./logo";
import { MobileNavigation } from "./mobile-navigation";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl"><PageContainer className="flex h-18 items-center justify-between gap-3"><Logo /><nav aria-label="Glavna navigacija" className="hidden items-center gap-6 md:flex">{storeNavigation.map((item) => <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{item.label}</Link>)}</nav><div className="flex items-center gap-0.5"><Button variant="ghost" size="icon" aria-label="Pretraga"><Search /></Button><ThemeToggle /><Link href="/auth/login" aria-label="Korisnički nalog" className="hidden size-10 items-center justify-center rounded-md hover:bg-accent sm:inline-flex"><UserRound className="size-4" /></Link><Button variant="ghost" size="icon" aria-label="Lista želja" className="hidden sm:inline-flex"><Heart /></Button><Button variant="ghost" size="icon" aria-label="Korpa" className="relative"><ShoppingBag /><span className="absolute right-1 top-1 size-2 rounded-full bg-primary" aria-hidden="true" /></Button><MobileNavigation /></div></PageContainer></header>;
}
