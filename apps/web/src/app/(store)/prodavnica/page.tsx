import { Suspense } from "react";
import { PageContainer } from "@/components/common/page-container";
import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton";
import { ShopCatalog } from "@/features/products/components/shop-catalog";

export const metadata = {
  title: "Prodavnica",
  description:
    "Istražite Green Nest ponudu ukrasnih biljaka i pronađite pravi izbor za svoj prostor.",
};

export default function ShopPage() {
  return (
    <PageContainer className="py-14 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
        Green Nest katalog
      </p>
      <h1 className="mt-3 font-serif text-5xl font-semibold sm:text-6xl">
        Biljke za svaki kutak.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
        Pretražite objavljenu ponudu, filtrirajte prema kategoriji i ceni i
        pronađite biljku koja odgovara vašem prostoru.
      </p>
      <Suspense fallback={<div className="mt-10"><ProductGridSkeleton /></div>}>
        <ShopCatalog />
      </Suspense>
    </PageContainer>
  );
}
