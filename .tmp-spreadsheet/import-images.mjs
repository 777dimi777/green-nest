import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = "C:/Users/Korisnik/AppData/Local/Temp";
const targetDir = "C:/Users/Korisnik/Desktop/green-nest/apps/api/uploads/seed-products";
const names = [
  "codex-clipboard-09b5330e-3c45-4500-bba5-30bd98e5566c.jpg", "codex-clipboard-30e1fb95-4bde-4afe-8b5a-f7174072567b.jpg", "codex-clipboard-b56a6a66-0dd5-45e8-a064-230b8da5a418.jpg",
  "codex-clipboard-98de0950-4ac7-401f-a655-422417ff5164.jpg",
  "codex-clipboard-23523457-7a7c-4c31-9c73-47077ebf95c2.jpg", "codex-clipboard-614f7795-0d81-4ecd-a501-20d817c6d94b.png", "codex-clipboard-8c19e070-205f-475c-8336-2780b35c7c7a.png",
  "codex-clipboard-721a5995-070a-4e96-b98f-ac8174401dee.jpg", "codex-clipboard-c2591d25-0207-4454-8c93-2662b5d147b4.png", "codex-clipboard-56634c87-c2ab-4e43-a715-1beaa3437e1b.png",
  "codex-clipboard-22dba3c5-77cc-4ae1-88a1-d9e5acc15bdc.jpg", "codex-clipboard-5277067a-18ea-41e2-94c4-446ad85fcc52.png", "codex-clipboard-7f47c134-20fa-41d6-8a0e-ed1051ca822e.png",
  "codex-clipboard-1f071ec8-2e78-4fb4-9bd5-88f24f630911.jpg",
  "codex-clipboard-c892dfae-df96-4772-a91a-8ec52bf4d812.png", "codex-clipboard-2dccfa37-7952-4a42-a5c4-e292dc6a93d5.png",
  "codex-clipboard-abc62999-fdf2-4513-9891-03062b1e2b5d.png", "codex-clipboard-f7b5d252-7898-401a-b3e7-2db51f907573.png", "codex-clipboard-c042fdc1-cd0b-4a6d-996e-a9067a434ee9.png",
  "codex-clipboard-7ad3065a-5f0c-4d0d-85e6-bdb4949008bf.png", "codex-clipboard-5770b917-747d-4940-b115-3da1f0026f80.png", "codex-clipboard-339dd817-0799-4706-ba19-976f7a887074.png",
  "codex-clipboard-0e4a374b-18d0-4c78-8b11-e0d3099984f1.jpg", "codex-clipboard-fab06b32-6a8f-4078-9956-f05d1ee2c882.png", "codex-clipboard-947daf02-fc38-47a2-8b95-50a12c089db8.png", "codex-clipboard-7605a2c7-1f08-46c6-a37f-2334240b01df.png",
  "codex-clipboard-ec97ab74-4141-448d-a689-ff60ba50dc7f.jpg", "codex-clipboard-ee29e1ee-6f6e-4aa6-9063-b81fa91042a0.png",
  "codex-clipboard-9fe35065-e86c-4357-8447-781d3773e8b5.png", "codex-clipboard-c7dd22ae-7959-451c-ad56-1c81ec30270d.png", "codex-clipboard-0a9912fa-e73f-4696-a4f5-3bbee8e2b202.jpg",
  "codex-clipboard-5c8c0d59-c09f-4e72-8959-5c1ddc321d94.jpg", "codex-clipboard-cefaf383-86c8-4ccc-a5a5-3f07142e9687.jpg",
  "codex-clipboard-8c581700-6b9e-4e66-948a-2a59968086a5.jpg", "codex-clipboard-cf1e7b24-ac3a-4551-ab4a-6d80b1e77c4a.jpg",
  "codex-clipboard-d20263c3-87ae-4081-b7c0-55c9695091ac.jpg", "codex-clipboard-ee2cc8e5-83ab-48de-b601-75d9d207e5c3.jpg",
  "codex-clipboard-05b19f70-664a-4f52-a865-f383ab5fed2e.jpg", "codex-clipboard-b1b8e11b-bbee-42e1-9f4e-b761d9684767.png", "codex-clipboard-116df146-b09e-4269-8d5d-8ebda740daa8.png",
  "codex-clipboard-656ca27f-9f0a-47e0-a218-329cfc570b40.jpg", "codex-clipboard-ece4fbf1-1949-496e-9e61-750a77959d1f.jpg",
  "codex-clipboard-d67db641-6075-4c80-ad81-6a2e53c75916.jpg", "codex-clipboard-cfaa1f93-c1c9-4923-b508-ec1af596a830.jpg",
  "codex-clipboard-01988e6a-62a4-49e4-b441-19093d1acc09.jpg", "codex-clipboard-d8957e3b-a005-443d-8731-fe4f2deaa2b9.jpg",
  "codex-clipboard-680a8ab4-f8e1-4331-b890-5b7dc6d28f90.jpg", "codex-clipboard-de881139-3a57-4f68-8896-fd223207ef17.jpg",
  "codex-clipboard-66725e92-f553-4eff-93c0-9f9524bd01dd.jpg", "codex-clipboard-d0074b89-961c-448f-b9ae-eac4c64a93ed.jpg",
  "codex-clipboard-e4517837-33a8-48fe-9684-79f8b271c226.jpg", "codex-clipboard-219fe591-2b3e-4439-a8e7-2be67d25484b.jpg",
  "codex-clipboard-322f5e94-c79b-4e8f-ba6d-a05f9830a285.jpg", "codex-clipboard-713d416b-5dcf-4499-8780-495a4c3c049a.jpg",
  "codex-clipboard-0ddd2a8c-f5ab-4e71-b999-66cb042438b5.jpg", "codex-clipboard-72e153f3-46fb-4ca6-80af-d67ac349d45a.jpg",
  "codex-clipboard-35ca80c6-414b-40f4-bdb0-8df4bf3981b2.png", "codex-clipboard-ac435e50-f5c4-42a8-9e5e-b8a2127c1cbb.png",
  "codex-clipboard-be419c76-25a0-48d7-b410-0e42f770c9df.png", "codex-clipboard-90d1e660-37eb-4ef5-9adb-40ec4f9f2fba.png",
  "codex-clipboard-4d85f9de-5436-4937-9086-305ec85fd789.jpg", "codex-clipboard-9be1a034-232c-4bb7-af64-d729460af459.jpg",
];

const groups = new Map([
  [6, [1, 2, 3]], [7, [4]], [8, [5, 6, 7]], [9, [8, 9, 10]], [10, [11, 12, 13]], [11, [14]],
  [12, [15, 16]], [13, [17, 18, 19]], [14, [20, 21, 22]], [15, [23, 24, 25]], [16, [27, 28]],
  [17, [29, 30, 31]], [18, [32, 33]], [19, [34, 35]], [20, [36, 37]], [22, [38, 39, 40]],
  [23, [41, 42]], [24, [43, 44]], [25, [45, 46]], [26, [47, 48]], [27, [49, 50]], [28, [51, 52]],
  [29, [53, 54]], [30, [55, 56]], [31, [57, 58]], [32, [59, 60]], [33, [61, 62]],
]);

await fs.mkdir(targetDir, { recursive: true });
for (const existing of await fs.readdir(targetDir)) await fs.rm(path.join(targetDir, existing), { force: true });

let count = 0;
for (const [row, sourceNumbers] of groups) {
  for (const [index, sourceNumber] of sourceNumbers.entries()) {
    const source = path.join(sourceDir, names[sourceNumber - 1]);
    const target = path.join(targetDir, `red-${row}-${index + 1}.webp`);
    await sharp(source).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(target);
    count += 1;
  }
}
console.log(`Imported ${count} catalog images.`);
