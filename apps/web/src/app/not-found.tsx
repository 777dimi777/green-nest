import Link from "next/link";
import { Leaf } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() { return <main className="grid min-h-screen place-items-center px-4 text-center"><div><Leaf className="mx-auto size-10 text-primary" /><p className="mt-6 text-sm font-semibold uppercase tracking-[.2em] text-primary">Greška 404</p><h1 className="mt-3 font-serif text-5xl font-semibold">Ova staza ne vodi do biljke.</h1><p className="mx-auto mt-4 max-w-lg text-muted-foreground">Stranica je premeštena, uklonjena ili nikada nije procvetala.</p><Link href="/" className={`${buttonVariants({ size: "lg" })} mt-8`}>Nazad na početnu</Link></div></main>; }
