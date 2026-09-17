import fs from "node:fs/promises";
const path = "C:/Users/Korisnik/Desktop/green-nest/apps/api/prisma/seed.ts";
const source = await fs.readFile(path, "utf8");
await fs.writeFile(
  path,
  source.replace(
    "image: `/uploads/seed-products/red-${first.row}-1.${first.row === 6 || first.row === 7 ? 'jpg' : 'webp'}`",
    "image: `/uploads/seed-products/red-${first.row}-1.webp`",
  ),
  "utf8",
);
