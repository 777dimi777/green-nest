"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { storeNavigation } from "@/lib/constants/navigation";
import { Logo } from "./logo";

export function MobileNavigation() {
  return <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Otvori navigaciju" className="md:hidden"><Menu /></Button></SheetTrigger><SheetContent><SheetTitle className="sr-only">Glavna navigacija</SheetTitle><SheetDescription className="sr-only">Izaberite stranicu koju želite da posetite.</SheetDescription><Logo className="mb-10" /><nav aria-label="Mobilna navigacija" className="flex flex-col gap-2">{storeNavigation.map((item) => <SheetClose asChild key={item.href}><Link className="rounded-lg px-3 py-3 text-lg font-medium hover:bg-muted" href={item.href}>{item.label}</Link></SheetClose>)}</nav><div className="mt-8 border-t pt-6"><SheetClose asChild><Link className="text-sm text-muted-foreground" href="/auth/login">Prijavite se na nalog</Link></SheetClose></div></SheetContent></Sheet>;
}
