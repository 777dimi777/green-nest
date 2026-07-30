import { LoadingSpinner } from "@/components/common/loading-spinner";
export default function Loading() { return <div className="grid min-h-[60vh] place-items-center"><div className="flex items-center gap-3 text-muted-foreground"><LoadingSpinner /> Učitavanje sadržaja…</div></div>; }
