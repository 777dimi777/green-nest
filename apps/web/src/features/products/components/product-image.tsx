"use client";

import Image from "next/image";
import { ImageOff, Leaf } from "lucide-react";
import { useState } from "react";
import { getMediaUrl } from "@/lib/utils/media";
import { cn } from "@/lib/utils/cn";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, 33vw",
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const url = getMediaUrl(src);

  if (!url || failed) {
    return (
      <div
        className={cn(
          "grid size-full place-items-center bg-gradient-to-br from-secondary to-muted text-primary",
          className,
        )}
        role="img"
        aria-label={`${alt} — slika nije dostupna`}
      >
        <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {failed ? <ImageOff className="size-8" /> : <Leaf className="size-8" />}
          Slika nije dostupna
        </span>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
