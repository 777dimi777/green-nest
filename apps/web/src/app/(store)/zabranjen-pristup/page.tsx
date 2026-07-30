import Link from "next/link";
import { ShieldX } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Zabranjen pristup" };

export default function ForbiddenPage() {
  return (
    <PageContainer className="grid min-h-[65vh] place-items-center py-16 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="size-8" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[.2em] text-destructive">
          Pristup odbijen
        </p>
        <h1 className="mt-3 font-serif text-5xl font-semibold">
          Ovaj prostor je samo za administratore.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Vaš nalog nema administratorsku ulogu. Frontend provera dopunjuje, ali
          ne zamenjuje, obavezne backend guardove.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/nalog" className={buttonVariants()}>
            Moj nalog
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline" })}
          >
            Početna
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
