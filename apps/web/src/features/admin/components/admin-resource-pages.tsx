"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { OrderStatus } from "@/types/order";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";
import { DataTable } from "./data-table";

function useAdminMutation<T>(key:readonly unknown[],fn:(value:T)=>Promise<unknown>){const client=useQueryClient();return useMutation({mutationFn:fn,onSuccess:async()=>{toast.success("Izmena je sačuvana.");await client.invalidateQueries({queryKey:key})},onError:error=>toast.error(getApiErrorMessage(error))})}
function Head({title,children}:{title:string;children?:React.ReactNode}){return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-primary">Administracija</p><h1 className="font-serif text-4xl font-semibold">{title}</h1></div>{children}</div>}
function State<T>({query,children}:{query:{isPending:boolean;isError:boolean;error:Error|null;data:T|undefined;refetch:()=>unknown};children:(data:T)=>React.ReactNode}){if(query.isPending)return <Skeleton className="h-96"/>;if(query.isError)return <ErrorState title="Podaci nisu dostupni" description={getApiErrorMessage(query.error)} onRetry={()=>void query.refetch()}/>;return <>{children(query.data as T)}</>}
function Pager({page,totalPages,onPage}:{page:number;totalPages:number;onPage:(page:number)=>void}){return <div className="mt-5 flex items-center justify-between"><Button variant="outline" disabled={page<=1} onClick={()=>onPage(page-1)}>Prethodna</Button><span className="text-sm">Strana {page} od {Math.max(totalPages,1)}</span><Button variant="outline" disabled={page>=totalPages} onClick={()=>onPage(page+1)}>Sledeća</Button></div>}

export function AdminProducts(){const[search,setSearch]=useState(""),[published,setPublished]=useState(""),[inStock,setInStock]=useState(""),[page,setPage]=useState(1);const query={search:search||undefined,published:published===""?undefined:published==="true",inStock:inStock===""?undefined:inStock==="true",page,limit:12,sortBy:"createdAt" as const,sortOrder:"desc" as const};const q=useQuery({queryKey:adminQueryKeys.products.list(query),queryFn:()=>adminApi.products.list(query)}),publish=useAdminMutation(adminQueryKeys.products.all,adminApi.products.publish),stock=useAdminMutation(adminQueryKeys.products.all,adminApi.products.stock),remove=useAdminMutation(adminQueryKeys.products.all,adminApi.products.remove);const reset=()=>setPage(1);return <><Head title="Proizvodi"><Link href="/admin/proizvodi/novi" className={buttonVariants()}>Novi proizvod</Link></Head><div className="mb-5 grid gap-3 sm:grid-cols-3"><label className="text-sm">Pretraga<Input value={search} onChange={e=>{setSearch(e.target.value);reset()}} placeholder="Naziv, opis ili SKU"/></label><label className="text-sm">Objava<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={published} onChange={e=>{setPublished(e.target.value);reset()}}><option value="">Svi proizvodi</option><option value="true">Objavljeni</option><option value="false">Neobjavljeni</option></select></label><label className="text-sm">Zalihe<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={inStock} onChange={e=>{setInStock(e.target.value);reset()}}><option value="">Sve zalihe</option><option value="true">Na stanju</option><option value="false">Nema na stanju</option></select></label></div><State query={q}>{data=><><DataTable rows={data.data} rowKey={p=>p.id} columns={[{key:"name",label:"Proizvod",render:p=><Link className="font-medium text-primary" href={`/admin/proizvodi/${p.id}`}>{p.name}</Link>},{key:"sku",label:"SKU",render:p=>p.sku},{key:"price",label:"Cena",render:p=>formatCurrency(p.discountPrice??p.price)},{key:"stock",label:"Zalihe",render:p=><Input aria-label={`Zalihe za ${p.name}`} className="w-24" type="number" min={0} defaultValue={p.stock} onBlur={e=>{const value=Number(e.target.value);if(value!==p.stock)stock.mutate({id:p.id,stock:value})}}/>},{key:"published",label:"Status objave",render:p=><Button size="sm" variant="outline" disabled={publish.isPending} onClick={()=>publish.mutate({id:p.id,published:!p.published})}>{p.published?"Objavljen":"Neobjavljen"}</Button>},{key:"actions",label:"Akcije",render:p=><Button size="sm" variant="destructive" disabled={remove.isPending} onClick={()=>{if(confirm("Obrisati proizvod?"))remove.mutate(p.id)}}>Obriši</Button>}]}/><Pager page={data.pagination.page} totalPages={data.pagination.totalPages} onPage={setPage}/></>}</State></>}

export function AdminCategories(){const q=useQuery({queryKey:adminQueryKeys.categories.all,queryFn:adminApi.categories.list}),remove=useAdminMutation(adminQueryKeys.categories.all,adminApi.categories.remove);return <><Head title="Kategorije"><Link href="/admin/kategorije/nova" className={buttonVariants()}>Nova kategorija</Link></Head><State query={q}>{rows=><DataTable rows={rows} rowKey={r=>r.id} columns={[{key:"name",label:"Naziv",render:r=><Link className="font-medium text-primary" href={`/admin/kategorije/${r.id}`}>{r.name}</Link>},{key:"description",label:"Opis",render:r=>r.description??"—"},{key:"count",label:"Proizvodi",render:r=>r._count.products},{key:"actions",label:"",render:r=><Button variant="destructive" size="sm" disabled={remove.isPending} onClick={()=>{if(confirm("Obrisati kategoriju?"))remove.mutate(r.id)}}>Obriši</Button>}]}/>}</State></>}

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Na čekanju",
  CONFIRMED: "Potvrđena",
  SHIPPED: "Poslata",
  DELIVERED: "Isporučena",
  CANCELLED: "Otkazana",
};

const nextOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const orderActionLabels: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Potvrdi",
  SHIPPED: "Označi kao poslatu",
  DELIVERED: "Označi kao isporučenu",
};

export function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const query = {
    page,
    statusFilter,
  };
  const q = useQuery({
    queryKey: adminQueryKeys.orders.list(query),
    queryFn: () =>
      adminApi.orders.list({
        page,
        limit: 10,
        status: statusFilter ? (statusFilter as OrderStatus) : undefined,
      }),
  });
  const changeStatus = useAdminMutation(
    adminQueryKeys.orders.all,
    adminApi.orders.status,
  );
  const cancel = useAdminMutation(
    adminQueryKeys.orders.all,
    adminApi.orders.cancel,
  );

  return (
    <>
      <Head title="Porudžbine">
        <select
          aria-label="Filter statusa"
          className="h-10 rounded-md border bg-background px-3"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Svi statusi</option>
          {(Object.keys(orderStatusLabels) as OrderStatus[]).map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>
      </Head>
      <State query={q}>
        {(data) => (
          <>
            <DataTable
              rows={data.data}
              rowKey={(order) => order.id}
              columns={[
                {
                  key: "number",
                  label: "Broj",
                  render: (order) => (
                    <Link
                      className="font-medium text-primary"
                      href={`/admin/porudzbine/${order.id}`}
                    >
                      {order.orderNumber}
                    </Link>
                  ),
                },
                {
                  key: "user",
                  label: "Kupac",
                  render: (order) => order.user.email,
                },
                {
                  key: "total",
                  label: "Ukupno",
                  render: (order) => formatCurrency(order.totalPrice),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (order) => orderStatusLabels[order.status],
                },
                {
                  key: "payment",
                  label: "Plaćanje",
                  render: (order) => order.paymentStatus,
                },
                {
                  key: "date",
                  label: "Datum",
                  render: (order) => formatDate(order.createdAt),
                },
                {
                  key: "actions",
                  label: "Akcije",
                  render: (order) => {
                    const next = nextOrderStatus[order.status];
                    return (
                      <div className="flex flex-wrap gap-2">
                        {next && (
                          <Button
                            size="sm"
                            disabled={
                              changeStatus.isPending || cancel.isPending
                            }
                            onClick={() => {
                              const message =
                                next === "SHIPPED"
                                  ? "Potvrditi da je porudžbina predata pošti/kuriru?"
                                  : next === "DELIVERED"
                                    ? "Potvrditi da je porudžbina isporučena?"
                                    : "Potvrditi porudžbinu?";
                              if (confirm(message)) {
                                changeStatus.mutate({
                                  id: order.id,
                                  status: next,
                                });
                              }
                            }}
                          >
                            {orderActionLabels[next]}
                          </Button>
                        )}
                        {(order.status === "PENDING" ||
                          order.status === "CONFIRMED") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              changeStatus.isPending || cancel.isPending
                            }
                            onClick={() => {
                              if (confirm("Otkazati porudžbinu?")) {
                                cancel.mutate(order.id);
                              }
                            }}
                          >
                            Otkaži
                          </Button>
                        )}
                      </div>
                    );
                  },
                },
              ]}
            />
            <Pager
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPage={setPage}
            />
          </>
        )}
      </State>
    </>
  );
}
export function AdminPayments(){const[page,setPage]=useState(1),[status,setStatus]=useState("");const q=useQuery({queryKey:adminQueryKeys.payments.list({page,status}),queryFn:()=>adminApi.payments.list({page,limit:10,status:status?status as "PENDING"|"COMPLETED"|"FAILED"|"REFUNDED":undefined})});return <><Head title="Plaćanja"><select aria-label="Filter statusa plaćanja" className="h-10 rounded-md border bg-background px-3" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">Svi statusi</option>{["PENDING","COMPLETED","FAILED","REFUNDED"].map(s=><option key={s}>{s}</option>)}</select></Head><State query={q}>{data=><><DataTable rows={data.data} rowKey={r=>r.id} columns={[{key:"id",label:"Transakcija",render:r=><Link className="font-medium text-primary" href={`/admin/placanja/${r.id}`}>{r.providerTransactionId??r.id}</Link>},{key:"method",label:"Metoda",render:r=>r.method},{key:"status",label:"Status",render:r=>r.status},{key:"amount",label:"Iznos",render:r=>formatCurrency(r.amount)},{key:"date",label:"Datum",render:r=>formatDate(r.createdAt)}]}/><Pager page={data.pagination.page} totalPages={data.pagination.totalPages} onPage={setPage}/></>}</State></>}

export function AdminCoupons(){const[search,setSearch]=useState(""),[active,setActive]=useState(""),[type,setType]=useState(""),[page,setPage]=useState(1);const query={search:search||undefined,active:active===""?undefined:active==="true",type:type?type as "PERCENTAGE"|"FIXED":undefined,page,limit:10};const q=useQuery({queryKey:adminQueryKeys.coupons.list(query),queryFn:()=>adminApi.coupons.list(query)}),remove=useAdminMutation(adminQueryKeys.coupons.all,adminApi.coupons.remove);return <><Head title="Kuponi"><Link href="/admin/kuponi/novi" className={buttonVariants()}>Novi kupon</Link></Head><div className="mb-5 grid gap-3 sm:grid-cols-3"><label className="text-sm">Pretraga<Input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Kod kupona"/></label><label className="text-sm">Aktivnost<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={active} onChange={e=>{setActive(e.target.value);setPage(1)}}><option value="">Svi</option><option value="true">Aktivni</option><option value="false">Neaktivni</option></select></label><label className="text-sm">Tip<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={type} onChange={e=>{setType(e.target.value);setPage(1)}}><option value="">Svi tipovi</option><option value="PERCENTAGE">Procenat</option><option value="FIXED">Fiksni</option></select></label></div><State query={q}>{result=><><DataTable rows={result.data} rowKey={r=>r.id} columns={[{key:"code",label:"Kod",render:r=><Link className="font-semibold text-primary" href={`/admin/kuponi/${r.id}`}>{r.code}</Link>},{key:"discount",label:"Popust",render:r=>r.percentage?`${r.percentage}%`:formatCurrency(r.fixedAmount??0)},{key:"usage",label:"Korišćenje",render:r=>`${r.usedCount}/${r.usageLimit??"∞"}`},{key:"active",label:"Status",render:r=>r.active?"Aktivan":"Neaktivan"},{key:"expires",label:"Ističe",render:r=>r.expiresAt?formatDate(r.expiresAt):"—"},{key:"actions",label:"Akcije",render:r=><Button size="sm" variant="destructive" disabled={remove.isPending} onClick={()=>{if(confirm("Obrisati kupon?"))remove.mutate(r.id)}}>Obriši</Button>}]}/><Pager page={result.pagination.page} totalPages={result.pagination.totalPages} onPage={setPage}/></>}</State></>}

export function AdminUsers(){const[search,setSearch]=useState(""),[page,setPage]=useState(1),[roleFilter,setRoleFilter]=useState("");const q=useQuery({queryKey:adminQueryKeys.users.list({search,page,roleFilter}),queryFn:()=>adminApi.users.list({search:search||undefined,page,limit:10,role:roleFilter?roleFilter as "CUSTOMER"|"ADMIN":undefined})});return <><Head title="Korisnici"><div className="flex gap-2"><Input className="w-56" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Ime ili email…"/><select aria-label="Filter uloge" className="rounded-md border bg-background px-3" value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1)}}><option value="">Sve uloge</option><option>CUSTOMER</option><option>ADMIN</option></select></div></Head><State query={q}>{data=><><DataTable rows={data.data} rowKey={r=>r.id} columns={[{key:"name",label:"Korisnik",render:r=><Link className="font-medium text-primary" href={`/admin/korisnici/${r.id}`}>{r.firstName} {r.lastName}</Link>},{key:"email",label:"Email",render:r=>r.email},{key:"role",label:"Uloga",render:r=>r.role},{key:"verified",label:"Verifikovan",render:r=>r.isVerified?"Da":"Ne"},{key:"date",label:"Registrovan",render:r=>formatDate(r.createdAt)}]}/><Pager page={data.pagination.page} totalPages={data.pagination.totalPages} onPage={setPage}/></>}</State></>}
