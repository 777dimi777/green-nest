import fs from "node:fs/promises";

const root = "C:/Users/Korisnik/Desktop/green-nest";
async function edit(relativePath, transform) {
  const path = `${root}/${relativePath}`;
  const before = await fs.readFile(path, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`No changes made to ${relativePath}`);
  await fs.writeFile(path, after, "utf8");
}

await edit("apps/api/src/modules/products/dto/create-product.dto.ts", (text) => {
  const start = text.indexOf("  @ApiPropertyOptional({\n    example: '60–80 cm'");
  const end = text.indexOf("  @ApiPropertyOptional({\n    example: true,\n    description: 'Da li se proizvod prikazuje", start);
  if (start < 0 || end < 0) throw new Error("DTO attribute block not found");
  const attributes = `  @ApiProperty({ example: 'Prunus laurocerasus', description: 'Latinski naziv' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  latinName!: string;

  @ApiProperty({ example: 'Zimzeleni žbun', description: 'Tip biljke' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  plantType!: string;

  @ApiPropertyOptional({ example: '100–130 cm', description: 'Visina biljke' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  height?: string;

  @ApiPropertyOptional({ example: '8–12 cm', description: 'Obim stabla' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trunkCircumference?: string;

  @ApiPropertyOptional({ example: '180–200 cm', description: 'Visina kalema ili krošnje' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  graftHeight?: string;

  @ApiPropertyOptional({ example: 'Ø 22 cm', description: 'Prečnik saksije' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  potDiameter?: string;

`;
  return text.slice(0, start) + attributes + text.slice(end);
});

await edit("apps/api/src/modules/products/products.service.ts", (text) =>
  text.replace(
    /        height: createProductDto\.height,[\s\S]*?        petFriendly: createProductDto\.petFriendly \?\? true,\n/,
    `        latinName: createProductDto.latinName,
        plantType: createProductDto.plantType,
        height: createProductDto.height,
        trunkCircumference: createProductDto.trunkCircumference,
        graftHeight: createProductDto.graftHeight,
        potDiameter: createProductDto.potDiameter,
`,
  ),
);

await edit("apps/web/src/types/product.ts", (text) =>
  text.replace(
    /  height: string \| null;[\s\S]*?  petFriendly: boolean;\n/,
    `  latinName: string;
  plantType: string;
  height: string | null;
  trunkCircumference: string | null;
  graftHeight: string | null;
  potDiameter: string | null;
`,
  ),
);

await edit("apps/web/src/features/products/components/product-details-view.tsx", (text) =>
  text
    .replace('import { ArrowLeft, Check } from "lucide-react";', 'import { ArrowLeft } from "lucide-react";')
    .replace(
      /  const details = \[[\s\S]*?  \]\.filter\(\(detail\): detail is \[string, string\] => Boolean\(detail\[1\]\)\);/,
      `  const details = [
    ["Latinski naziv", product.latinName],
    ["Tip", product.plantType],
    ["Visina", product.height],
    ["Obim stabla", product.trunkCircumference],
    ["Visina kalema / krošnje", product.graftHeight],
    ["Prečnik saksije", product.potDiameter],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));`,
    )
    .replace(/          <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">[\s\S]*?          <\/div>\n          \{details\.length/, "          {details.length"),
);

await edit("apps/web/src/features/admin/components/product-editor.tsx", (text) =>
  text
    .replace(
      `  categoryId: z.string().min(1),
  height: optionalText,
  potSize: optionalText,
  light: optionalText,
  watering: optionalText,
  temperature: optionalText,
  humidity: optionalText,
  difficulty: optionalText,
  growthRate: optionalText,
  origin: optionalText,
  toxicity: optionalText,
  airPurifying: z.boolean(),
  petFriendly: z.boolean(),`,
      `  categoryId: z.string().min(1),
  latinName: z.string().min(2).max(200),
  plantType: z.string().min(2).max(100),
  height: optionalText,
  trunkCircumference: optionalText,
  graftHeight: optionalText,
  potDiameter: optionalText,`,
    )
    .replace(
      /const details = \[[\s\S]*?\] as const;/,
      `const details = [
  ["latinName", "Latinski naziv"],
  ["plantType", "Tip biljke"],
  ["height", "Visina (cm)"],
  ["trunkCircumference", "Obim stabla (cm)"],
  ["graftHeight", "Visina kalema / krošnje (cm)"],
  ["potDiameter", "Prečnik saksije (Ø)"],
] as const;`,
    )
    .replace(
      /      height: product\?\.height \?\? "",[\s\S]*?      petFriendly: product\?\.petFriendly \?\? true,\n/,
      `      latinName: product?.latinName ?? "",
      plantType: product?.plantType ?? "",
      height: product?.height ?? "",
      trunkCircumference: product?.trunkCircumference ?? "",
      graftHeight: product?.graftHeight ?? "",
      potDiameter: product?.potDiameter ?? "",
`,
    )
    .replace('["airPurifying", "petFriendly", "featured", "published"] as const', '["featured", "published"] as const')
    .replace('                  airPurifying: "Prečišćava vazduh",\n                  petFriendly: "Pet friendly",\n', ""),
);

const migrationDir = `${root}/apps/api/prisma/migrations/20260825090000_replace_product_attributes`;
await fs.mkdir(migrationDir, { recursive: true });
await fs.writeFile(
  `${migrationDir}/migration.sql`,
  `ALTER TABLE "products"
ADD COLUMN "latinName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "plantType" TEXT NOT NULL DEFAULT '',
ADD COLUMN "trunkCircumference" TEXT,
ADD COLUMN "graftHeight" TEXT,
ADD COLUMN "potDiameter" TEXT;

ALTER TABLE "products"
DROP COLUMN "potSize",
DROP COLUMN "light",
DROP COLUMN "watering",
DROP COLUMN "temperature",
DROP COLUMN "humidity",
DROP COLUMN "difficulty",
DROP COLUMN "growthRate",
DROP COLUMN "origin",
DROP COLUMN "toxicity",
DROP COLUMN "airPurifying",
DROP COLUMN "petFriendly";

ALTER TABLE "products"
ALTER COLUMN "latinName" DROP DEFAULT,
ALTER COLUMN "plantType" DROP DEFAULT;
`,
  "utf8",
);
