"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCatalogUrl } from "../hooks/use-catalog-url";

export function ProductSearch({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const updateUrl = useCatalogUrl();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (value.trim() === initialValue) return;
      updateUrl({ search: value.trim() || null, page: null }, true);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [initialValue, updateUrl, value]);

  return (
    <div className="relative w-full max-w-xl">
      <Label htmlFor="catalog-search" className="sr-only">
        Pretražite proizvode
      </Label>
      <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
      <Input
        id="catalog-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Pretražite biljke, opise ili SKU…"
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Obriši pretragu"
          className="absolute right-0.5 top-0.5"
          onClick={() => setValue("")}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
