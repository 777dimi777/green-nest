import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/45 px-4 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Nazad na početnu
        </Link>
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-serif text-2xl font-bold"
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </span>
          Green Nest
        </Link>
        {children}
      </div>
    </main>
  );
}
