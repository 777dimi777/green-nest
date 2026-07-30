import { PageContainer } from "@/components/common/page-container";
import { CategoriesGrid } from "@/features/categories/components/categories-grid";

export const metadata = {
  title: "Kategorije",
  description:
    "Pregledajte Green Nest kategorije biljaka i pronađite izbor za svoj prostor.",
};

export default function CategoriesPage() {
  return (
    <PageContainer className="py-14 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
        Pronađite svoj izbor
      </p>
      <h1 className="mt-3 font-serif text-5xl font-semibold sm:text-6xl">
        Kategorije biljaka
      </h1>
      <p className="mb-10 mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
        Istražite stvarne kategorije iz Green Nest kataloga i otvorite ponudu
        koja najbolje odgovara vašem domu.
      </p>
      <CategoriesGrid />
    </PageContainer>
  );
}
