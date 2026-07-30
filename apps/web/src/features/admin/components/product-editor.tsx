"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/features/products/components/product-image";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { ProductDetails } from "@/types/product";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";

const optionalText=z.string().max(300).optional();
const schema=z.object({name:z.string().min(2).max(150),description:z.string().min(10).max(5000),sku:z.string().min(1).max(50),price:z.coerce.number().positive(),discountPrice:z.union([z.coerce.number().positive(),z.literal("")]).optional(),stock:z.coerce.number().int().min(0),categoryId:z.string().min(1),height:optionalText,potSize:optionalText,light:optionalText,watering:optionalText,temperature:optionalText,humidity:optionalText,difficulty:optionalText,growthRate:optionalText,origin:optionalText,toxicity:optionalText,airPurifying:z.boolean(),petFriendly:z.boolean(),featured:z.boolean(),published:z.boolean()});
type InputValues=z.input<typeof schema>;
type Values=z.output<typeof schema>;
const details=[["height","Visina"],["potSize","Veličina saksije"],["light","Svetlost"],["watering","Zalivanje"],["temperature","Temperatura"],["humidity","Vlažnost"],["difficulty","Težina nege"],["growthRate","Brzina rasta"],["origin","Poreklo"],["toxicity","Toksičnost"]] as const;

export function ProductEditor({id}:{id?:string}){
 const product=useQuery({queryKey:adminQueryKeys.products.detail(id ?? "new"),queryFn:()=>adminApi.products.detail(id as string),enabled:!!id});
 if(id&&product.isPending)return <Skeleton className="h-96"/>;
 if(id&&product.isError)return <ErrorState title="Proizvod nije dostupan" description={getApiErrorMessage(product.error)}/>;
 return <ProductForm product={product.data}/>;
}
function ProductForm({product}:{product?:ProductDetails}){
 const router=useRouter(),client=useQueryClient(),categories=useQuery({queryKey:adminQueryKeys.categories.all,queryFn:adminApi.categories.list});
 const [files,setFiles]=useState<File[]>([]);
 const save=useMutation({mutationFn:(payload:object)=>product?adminApi.products.update({id:product.id,payload}):adminApi.products.create(payload),onSuccess:async created=>{toast.success("Proizvod je sačuvan.");await client.invalidateQueries({queryKey:adminQueryKeys.products.all});for(const [index,file]of files.entries())await adminApi.products.upload({id:created.id,file,isPrimary:index===0&&!created.images.length});router.push(`/admin/proizvodi/${created.id}`)},onError:e=>toast.error(getApiErrorMessage(e))});
 const imageAction=useMutation({mutationFn:async(action:{type:"delete"|"primary";imageId:string})=>action.type==="delete"?adminApi.products.removeImage({productId:product!.id,imageId:action.imageId}):adminApi.products.setPrimary({productId:product!.id,imageId:action.imageId}),onSuccess:async()=>{toast.success("Slike su ažurirane.");await client.invalidateQueries({queryKey:adminQueryKeys.products.detail(product?.id ?? '')})},onError:e=>toast.error(getApiErrorMessage(e))});
 const {register,handleSubmit,formState:{errors}}=useForm<InputValues,unknown,Values>({resolver:zodResolver(schema),defaultValues:{name:product?.name??"",description:product?.description??"",sku:product?.sku??"",price:Number(product?.price??0),discountPrice:product?.discountPrice?Number(product.discountPrice):"",stock:product?.stock??0,categoryId:product?.categoryId??"",height:product?.height??"",potSize:product?.potSize??"",light:product?.light??"",watering:product?.watering??"",temperature:product?.temperature??"",humidity:product?.humidity??"",difficulty:product?.difficulty??"",growthRate:product?.growthRate??"",origin:product?.origin??"",toxicity:product?.toxicity??"",airPurifying:product?.airPurifying??false,petFriendly:product?.petFriendly??true,featured:product?.featured??false,published:product?.published??true}});
 if(categories.isPending)return <Skeleton className="h-96"/>;
 return <><p className="text-sm text-primary">Admin / Proizvodi</p><h1 className="mt-2 font-serif text-4xl font-semibold">{product?"Izmena proizvoda":"Novi proizvod"}</h1>
 <form className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-2" onSubmit={handleSubmit(values=>save.mutate({...values,discountPrice:values.discountPrice===""?undefined:values.discountPrice}))}>
  <Field name="name" label="Naziv" register={register} error={errors.name?.message}/><Field name="sku" label="SKU" register={register} error={errors.sku?.message}/>
  <Field name="price" label="Cena" type="number" register={register} error={errors.price?.message}/><Field name="discountPrice" label="Snižena cena" type="number" register={register}/>
  <Field name="stock" label="Zalihe" type="number" register={register} error={errors.stock?.message}/><div><Label htmlFor="categoryId">Kategorija</Label><select id="categoryId" className="h-10 w-full rounded-md border bg-background px-3" {...register("categoryId")}><option value="">Izaberite</option>{categories.data?.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.categoryId&&<p className="text-xs text-destructive">Izaberite kategoriju.</p>}</div>
  <div className="sm:col-span-2"><Label htmlFor="description">Opis</Label><textarea id="description" rows={6} className="w-full rounded-md border bg-background p-3" {...register("description")}/>{errors.description&&<p className="text-xs text-destructive">{errors.description.message}</p>}</div>
  {details.map(([name,label])=><Field key={name} name={name} label={label} register={register}/>)}
  <div className="flex flex-wrap gap-5 sm:col-span-2">{(["airPurifying","petFriendly","featured","published"]as const).map(name=><label key={name} className="flex items-center gap-2"><input type="checkbox" {...register(name)}/>{({airPurifying:"Prečišćava vazduh",petFriendly:"Pet friendly",featured:"Izdvojen",published:"Objavljen"})[name]}</label>)}</div>
  <div className="sm:col-span-2"><Label htmlFor="product-images">Nove slike</Label><Input id="product-images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>setFiles(Array.from(e.target.files??[]).filter(f=>f.size<=5*1024*1024))}/><div className="mt-3 grid gap-3 sm:grid-cols-3">{files.map((file,index)=><SelectedImage key={`${file.name}-${index}`} file={file} onRemove={()=>setFiles(current=>current.filter((_,i)=>i!==index))}/>)}</div></div>
  <Button className="sm:col-span-2" disabled={save.isPending}>{save.isPending?"Čuvanje…":"Sačuvaj proizvod"}</Button>
 </form>
 {product&&product.images.length>0&&<section className="mt-10 max-w-4xl"><h2 className="font-serif text-2xl font-semibold">Postojeće slike</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{product.images.map(image=><div key={image.id} className="rounded-xl border p-3"><div className="aspect-square overflow-hidden rounded-lg bg-muted"><ProductImage src={image.url} alt={image.alt??product.name}/></div><div className="mt-3 flex gap-2">{!image.isPrimary&&<Button size="sm" variant="outline" disabled={imageAction.isPending} onClick={()=>imageAction.mutate({type:"primary",imageId:image.id})}>Glavna</Button>}<Button size="sm" variant="destructive" disabled={imageAction.isPending} onClick={()=>{if(confirm("Obrisati sliku?"))imageAction.mutate({type:"delete",imageId:image.id})}}>Obriši</Button></div></div>)}</div></section>}</>;
}
function SelectedImage({file,onRemove}:{file:File;onRemove:()=>void}){
 const url=useMemo(()=>URL.createObjectURL(file),[file]);
 useEffect(()=>()=>URL.revokeObjectURL(url),[url]);
 return <div className="rounded-xl border p-3"><div className="relative aspect-square overflow-hidden rounded-lg bg-muted"><Image src={url} alt={`Pregled slike ${file.name}`} fill unoptimized className="object-cover"/></div><div className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-xs">{file.name}</span><button type="button" className="text-sm text-destructive" aria-label={`Ukloni ${file.name}`} onClick={onRemove}>Ukloni</button></div></div>;
}
function Field({name,label,type="text",register,error}:{name:keyof InputValues;label:string;type?:string;register:UseFormRegister<InputValues>;error?:string}){return <div><Label htmlFor={name}>{label}</Label><Input id={name} type={type} step={type==="number"?"0.01":undefined} {...register(name)}/>{error&&<p className="text-xs text-destructive">{error}</p>}</div>}
