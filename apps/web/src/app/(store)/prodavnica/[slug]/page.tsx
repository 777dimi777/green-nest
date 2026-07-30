import type { Metadata } from "next";
import { PageContainer } from "@/components/common/page-container";
import { ProductDetailsView } from "@/features/products/components/product-details-view";

export const metadata: Metadata = {
  title: "Detalji proizvoda",
  description: "Detalji proizvoda iz Green Nest kataloga.",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PageContainer className="py-10 sm:py-14">
      <ProductDetailsView slug={slug} />
    </PageContainer>
  );
}
