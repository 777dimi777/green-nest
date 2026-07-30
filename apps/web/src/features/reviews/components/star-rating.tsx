"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StarRating({value,onChange,readOnly=false}:{value:number;onChange?:(value:number)=>void;readOnly?:boolean}){
 return <div className="flex gap-1" role={readOnly?"img":"radiogroup"} aria-label={`Ocena ${value} od 5`}>
  {[1,2,3,4,5].map(star=>readOnly?<Star key={star} aria-hidden className={cn("size-5",star<=value?"fill-amber-400 text-amber-400":"text-muted-foreground/35")}/>:<button key={star} type="button" role="radio" aria-checked={star===value} aria-label={`${star} od 5 zvezdica`} className="rounded p-1 focus-visible:outline-2 focus-visible:outline-ring" onClick={()=>onChange?.(star)}><Star className={cn("size-6",star<=value?"fill-amber-400 text-amber-400":"text-muted-foreground")}/></button>)}
 </div>;
}
