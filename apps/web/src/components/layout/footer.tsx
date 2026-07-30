import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { Separator } from "@/components/ui/separator";
import { storeNavigation } from "@/lib/constants/navigation";
import { Logo } from "./logo";

export function Footer() {
  return <footer className="mt-auto border-t bg-card"><PageContainer className="grid gap-10 py-14 md:grid-cols-3"><div><Logo /><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Pažljivo odabrane biljke i podrška koja pomaže da vaš dom raste zelenije.</p></div><div><h2 className="font-semibold">Navigacija</h2><nav className="mt-4 grid gap-2 text-sm text-muted-foreground">{storeNavigation.map((item) => <Link key={item.href} href={item.href} className="hover:text-foreground">{item.label}</Link>)}</nav></div><div><h2 className="font-semibold">Podrška</h2><div className="mt-4 grid gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Mail className="size-4" /> kontakt@primer.greennest.rs</span><span className="flex items-center gap-2"><Phone className="size-4" /> Razvojni kontakt biće dodat</span><Link href="/o-nama" className="hover:text-foreground">Česta pitanja i isporuka — uskoro</Link></div></div></PageContainer><PageContainer><Separator /><p className="py-6 text-sm text-muted-foreground">© {new Date().getFullYear()} Green Nest. Sva prava zadržana.</p></PageContainer></footer>;
}
