import { Sprout } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";

export const metadata = { title: "Prodavnica" };
export default function ShopPage() { return <PageContainer className="py-20"><h1 className="mb-8 font-serif text-5xl font-semibold">Prodavnica</h1><EmptyState icon={Sprout} title="Ponuda uskoro stiže" description="Katalog će u sledećem segmentu biti povezan sa Products API-jem, filterima i paginacijom." /></PageContainer>; }
