"use client";

import { useState } from "react";
import type { ProductImage as ProductImageType } from "@/types/product";
import { ProductImage } from "./product-image";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageType[];
  productName: string;
}) {
  const initialIndex = Math.max(
    0,
    images.findIndex((image) => image.isPrimary),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border bg-muted">
        <ProductImage
          src={activeImage?.url}
          alt={activeImage?.alt || productName}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Prikaži sliku ${index + 1} proizvoda ${productName}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              className="relative aspect-square overflow-hidden rounded-xl border bg-muted ring-offset-2 aria-current:ring-2 aria-current:ring-ring"
            >
              <ProductImage
                src={image.url}
                alt=""
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
