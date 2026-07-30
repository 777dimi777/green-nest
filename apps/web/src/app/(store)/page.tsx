import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Lightbulb,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { NewsletterForm } from "@/components/common/newsletter-form";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeading } from "@/components/common/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { HomeCategoriesPreview } from "@/features/categories/components/home-categories-preview";
import { HomeProductsPreview } from "@/features/products/components/home-products-preview";
import { cn } from "@/lib/utils/cn";

const benefits = [
  {
    icon: PackageCheck,
    title: "Pažljivo pakovanje",
    text: "Svaka biljka putuje bezbedno, zaštićena i spremna za novi dom.",
  },
  {
    icon: Lightbulb,
    title: "Stručni saveti",
    text: "Jasna uputstva za svetlost, zalivanje i dug, zdrav rast.",
  },
  {
    icon: ShieldCheck,
    title: "Sigurna kupovina",
    text: "Pouzdan proces kupovine i transparentne informacije.",
  },
  {
    icon: Headphones,
    title: "Podrška kupcima",
    text: "Tu smo za pitanja pre i nakon što biljka stigne.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden py-16 sm:py-24 lg:py-28">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 -z-10 size-[32rem] rounded-full bg-secondary/75 blur-3xl"
        />
        <PageContainer className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-primary">
              <Sparkles className="size-3.5" /> Priroda, pažljivo odabrana
            </div>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">
              Dom koji raste zajedno sa vama.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              Ukrasne biljke, elegantne saksije i praktično znanje za topliji,
              zeleniji prostor — bez komplikovanja.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/prodavnica"
                className={cn(buttonVariants({ size: "lg" }), "group")}
              >
                Istraži biljke
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/o-nama"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Saznaj više
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/4.4] w-full max-w-lg rounded-[2.5rem] border bg-gradient-to-br from-[#dce8da] via-[#f1ebdc] to-[#c8d9ce] p-8 shadow-[0_35px_90px_-45px_rgba(29,72,48,.7)] dark:from-[#284033] dark:via-[#29332d] dark:to-[#1e3027]">
            <div className="absolute left-[18%] top-[14%] h-[48%] w-[22%] rotate-[-18deg] rounded-[100%_0_100%_0] bg-primary/70" />
            <div className="absolute right-[17%] top-[19%] h-[43%] w-[25%] rotate-[20deg] rounded-[0_100%_0_100%] bg-primary/55" />
            <div className="absolute left-[42%] top-[9%] h-[55%] w-2 rounded-full bg-primary/70" />
            <div className="absolute bottom-[12%] left-1/2 h-[34%] w-[46%] -translate-x-1/2 rounded-b-[3rem] rounded-t-[1rem] bg-[#a77d58] shadow-xl" />
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border bg-card/85 p-4 backdrop-blur">
              <p className="font-serif text-xl font-semibold">
                Zelenilo sa karakterom
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pažljivo odabrane biljke za prostor koji je zaista vaš.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="border-y bg-card/60 py-10">
        <PageContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </PageContainer>
      </section>

      <section className="py-20 sm:py-24">
        <PageContainer>
          <SectionHeading
            eyebrow="Pažljivo odabrano"
            title="Izdvojene biljke"
            description="Proizvodi koje smo označili kao posebno vredne pažnje."
            action={
              <Link
                href="/prodavnica"
                className={buttonVariants({ variant: "outline" })}
              >
                Cela ponuda <ArrowRight />
              </Link>
            }
          />
          <div className="mt-10">
            <HomeProductsPreview />
          </div>
        </PageContainer>
      </section>

      <section className="bg-muted/50 py-20 sm:py-24">
        <PageContainer>
          <SectionHeading
            eyebrow="Pronađite svoj izbor"
            title="Kolekcije za svaki prostor"
            description="Stvarne kategorije iz Green Nest kataloga."
          />
          <div className="mt-10">
            <HomeCategoriesPreview />
          </div>
        </PageContainer>
      </section>

      <section className="py-20 sm:py-24">
        <PageContainer>
          <div className="overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 lg:px-16">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium opacity-85">
                <BadgeCheck className="size-4" /> Green Nest beleške
              </div>
              <h2 className="font-serif text-4xl font-semibold sm:text-5xl">
                Malo više zelenog u vašem inboxu.
              </h2>
              <p className="mt-4 leading-7 opacity-80">
                Saveti za negu i novosti iz ponude. Prijava još nije aktivna —
                obavestićemo vas kada bude spremna.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
