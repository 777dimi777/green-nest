import Link from "next/link";
import { Mail } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { Separator } from "@/components/ui/separator";
import { storeNavigation } from "@/lib/constants/navigation";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <PageContainer className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Pažljivo odabrane biljke i podrška koja pomaže da vaš dom raste
            zelenije.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Navigacija</h2>
          <nav className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {storeNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="font-semibold">Podrška</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <a
              href="mailto:kontakt@greennest.rs"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="size-4" /> kontakt@greennest.rs
            </a>
            <Link href="/o-nama" className="hover:text-foreground">
              O nama i informacije o kupovini
            </Link>
          </div>
        </div>
      </PageContainer>
      <PageContainer>
        <Separator />
        <p className="py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Green Nest. Sva prava zadržana.
        </p>
      </PageContainer>
    </footer>
  );
}
