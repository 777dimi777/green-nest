import fs from "node:fs/promises";
const root = "C:/Users/Korisnik/Desktop/green-nest";
async function edit(file, transform) {
  const path = `${root}/${file}`;
  const before = await fs.readFile(path, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`No changes in ${file}`);
  await fs.writeFile(path, after, "utf8");
}

await edit("apps/api/src/modules/products/dto/create-product.dto.ts", (text) =>
  text.replace(
    `  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  price!: number;`,
    `  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  price!: number;`,
  ),
);

await edit("apps/web/src/features/admin/components/product-editor.tsx", (text) =>
  text.replace("price: z.coerce.number().positive(),", "price: z.coerce.number().nonnegative(),"),
);

await edit("apps/web/src/features/products/components/product-card.tsx", (text) =>
  text.replace(
    `{product.discountPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </p>
              )}
              <p className="text-lg font-semibold">
                {formatCurrency(activePrice)}
              </p>`,
    `{Number(activePrice) > 0 ? (
                <>
                  {product.discountPrice && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                    </p>
                  )}
                  <p className="text-lg font-semibold">{formatCurrency(activePrice)}</p>
                </>
              ) : (
                <p className="text-lg font-semibold">Cena na upit</p>
              )}`,
  ),
);

await edit("apps/web/src/features/products/components/product-details-view.tsx", (text) =>
  text.replace(
    `<p className="text-3xl font-semibold">{formatCurrency(activePrice)}</p>
            {product.discountPrice && (`,
    `<p className="text-3xl font-semibold">
              {Number(activePrice) > 0 ? formatCurrency(activePrice) : "Cena na upit"}
            </p>
            {Number(activePrice) > 0 && product.discountPrice && (`,
  ),
);
