"use client";
import Link from "next/link";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { NotificationMenu } from "@/features/notifications/components/notification-menu";
import { storeNavigation } from "@/lib/constants/navigation";
import { Logo } from "./logo";
import { MobileNavigation } from "./mobile-navigation";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
 const {isAuthenticated}=useAuth(),wishlist=useWishlist(),cart=useCart();
 return <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl"><PageContainer className="flex h-18 items-center justify-between gap-3"><Logo/>
 <nav aria-label="Glavna navigacija" className="hidden items-center gap-6 md:flex">{storeNavigation.map(item=><Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{item.label}</Link>)}</nav>
 <div className="flex items-center gap-0.5"><IconLink href="/prodavnica#catalog-search" label="Pretraži proizvode"><Search/></IconLink><ThemeToggle/><NotificationMenu/><AccountMenu/>
 <IconLink href={isAuthenticated?"/lista-zelja":"/auth/login?redirect=%2Flista-zelja"} label="Lista želja" className="hidden sm:inline-flex"><Heart/>{isAuthenticated&&(wishlist.data?.total??0)>0&&<Badge count={wishlist.data?.total??0} label="proizvoda u listi želja"/>}</IconLink>
 <IconLink href={isAuthenticated?"/korpa":"/auth/login?redirect=%2Fkorpa"} label="Korpa"><ShoppingBag/>{isAuthenticated&&(cart.data?.summary.totalItems??0)>0&&<Badge count={cart.data?.summary.totalItems??0} label="proizvoda u korpi"/>}</IconLink><MobileNavigation/></div>
 </PageContainer></header>;
}
function IconLink({href,label,className="",children}:{href:string;label:string;className?:string;children:React.ReactNode}){return <Link href={href} aria-label={label} className={`relative inline-flex size-10 items-center justify-center rounded-md hover:bg-accent [&_svg]:size-4 ${className}`}>{children}</Link>}
function Badge({count,label}:{count:number;label:string}){return <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[11px] font-bold leading-5 text-primary-foreground"><span aria-hidden>{count>99?"99+":count}</span><span className="sr-only">{count} {label}</span></span>}
