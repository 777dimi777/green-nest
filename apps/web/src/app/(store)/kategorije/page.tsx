import { Shapes } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";

export const metadata = { title: "Kategorije" };
export default function CategoriesPage() { return <PageContainer className="py-20"><h1 className="mb-8 font-serif text-5xl font-semibold">Kategorije</h1><EmptyState icon={Shapes} title="Kategorije su u pripremi" description="Ova ruta je spremna za javni Categories API bez privremenih ili izmišljenih podataka." /></PageContainer>; }
