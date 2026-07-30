"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton";
import { ProductCard } from "@/features/products/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useWishlist } from "../hooks/use-wishlist";

export function WishlistPage(){
 const query=useWishlist();
 if(query.isPending)return <ProductGridSkeleton/>;
 if(query.isError)return <ErrorState title="Lista želja nije dostupna" description={getApiErrorMessage(query.error)} onRetry={()=>void query.refetch()}/>;
 return <><div className="mb-8"><h1 className="font-serif text-5xl font-semibold">Lista želja</h1><p className="mt-2 text-muted-foreground">{query.data.total} sačuvanih proizvoda</p></div>
 {query.data.data.length===0?<EmptyState icon={Heart} title="Lista želja je prazna" description="Sačuvajte biljke koje želite da pogledate kasnije." action={<Link href="/prodavnica" className={buttonVariants()}>Istraži prodavnicu</Link>}/>:<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.data.map(item=><ProductCard key={item.id} product={item.product}/>)}</div>}</>;
}
