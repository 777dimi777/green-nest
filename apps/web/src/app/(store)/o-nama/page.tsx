import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Sprout,
  SunMedium,
  Truck,
} from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { buttonVariants } from "@/components/ui/button";
export const metadata = {
  title: "O nama",
  description:
    "Upoznajte Green Nest iz Kruševca — biljke, praktični saveti i podrška za zeleniji dom.",
};
const values = [
  [
    Sprout,
    "Pažljiv izbor",
    "Biramo zdrave biljke koje mogu lepo da napreduju u stvarnim kućnim uslovima.",
  ],
  [
    HeartHandshake,
    "Podrška pri izboru",
    "Preporučujemo biljku prema svetlu, iskustvu i vremenu koje imate za negu.",
  ],
  [
    ShieldCheck,
    "Sigurno pakovanje",
    "Listove, zemlju i saksiju štitimo tokom pripreme i dostave.",
  ],
  [
    Truck,
    "Iz Kruševca do vas",
    "Porudžbine pripremamo u Kruševcu i šaljemo širom Srbije.",
  ],
] as const;
const tips = [
  [
    "Proverite svetlo",
    "Pratite gde direktno sunce pada tokom dana pre nego što izaberete biljku.",
  ],
  [
    "Ne zalivajte po rasporedu",
    "Dodirnite zemlju — većina sobnih biljaka više pati od viška vode.",
  ],
  [
    "Dajte biljci vreme",
    "Posle selidbe je normalno da biljka nekoliko nedelja uspori rast.",
  ],
] as const;
export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b bg-card">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <PageContainer className="relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-primary">
              Green Nest · Kruševac
            </p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight sm:text-6xl">
              Pomažemo da biljke postanu deo doma, a ne još jedna obaveza.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Green Nest je nastao u Kruševcu iz ljubavi prema biljkama i želje
              da kupovina bude jednostavna, iskrena i korisna. Biramo biljke i
              opremu za negu, objašnjavamo šta im zaista treba i ostajemo
              dostupni kada stignu u vaš dom.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/prodavnica"
                className={buttonVariants({ size: "lg" })}
              >
                Pogledaj biljke <ArrowRight className="ml-2 size-4" />
              </Link>
              <a
                href="tel:061608011306"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <Phone className="mr-2 size-4" />
                Pozovi Jovana
              </a>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[2rem] border bg-primary/10">
            <div className="absolute inset-12 rounded-full border border-primary/25" />
            <Leaf
              className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 text-primary"
              strokeWidth={1.2}
            />
            <SunMedium className="absolute right-10 top-10 size-14 text-amber-400" />
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border bg-background/90 p-5 shadow-xl">
              <p className="font-serif text-2xl font-semibold">
                Zelenilo sa razlogom
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Biljka prilagođena vašem prostoru ima najveću šansu da dugo
                traje.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>
      <PageContainer className="grid gap-5 py-20 md:grid-cols-2 xl:grid-cols-4">
        {values.map(([Icon, title, text]) => (
          <article key={title} className="rounded-2xl border bg-card p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-5 font-serif text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {text}
            </p>
          </article>
        ))}
      </PageContainer>
      <section className="border-y bg-muted/35">
        <PageContainer className="grid gap-10 py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              Gde smo
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold">
              Naša baza je u Kruševcu
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Odavde pripremamo porudžbine, odgovaramo na pitanja i gradimo
              Green Nest ponudu. Za izbor biljke ili postojeću porudžbinu
              kontaktirajte Jovana.
            </p>
            <div className="mt-7 space-y-4 rounded-2xl border bg-card p-6">
              <p className="flex gap-3">
                <MapPin className="text-primary" />
                Kruševac, Srbija
              </p>
              <div className="flex gap-3">
                <Phone className="text-primary" />
                <div>
                  <strong>Jovan Stojanović</strong>
                  <p>
                    <a
                      className="text-primary hover:underline"
                      href="tel:061608011306"
                    >
                      061 608 011 306
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <iframe
              title="Green Nest — Kruševac na mapi"
              src="https://www.openstreetmap.org/export/embed.html?bbox=21.286%2C43.548%2C21.365%2C43.612&layer=mapnik&marker=43.583%2C21.326"
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="flex justify-between border-t p-4 text-sm">
              <span>Kruševac, Rasinski okrug</span>
              <a
                className="text-primary hover:underline"
                href="https://www.openstreetmap.org/?mlat=43.583&mlon=21.326#map=13/43.583/21.326"
                target="_blank"
                rel="noreferrer"
              >
                Otvori mapu
              </a>
            </div>
          </div>
        </PageContainer>
      </section>
      <PageContainer className="grid gap-12 py-20 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
            Kratak vodič
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold">
            Tri stvari koje svaka biljka želi
          </h2>
          <p className="mt-5 text-muted-foreground">
            Dobra nega počinje uslovima u prostoru, pa tek onda izborom vrste.
          </p>
        </div>
        <div className="divide-y rounded-2xl border bg-card px-6">
          {tips.map(([title, text], i) => (
            <article
              key={title}
              className="grid gap-3 py-6 sm:grid-cols-[48px_1fr]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
