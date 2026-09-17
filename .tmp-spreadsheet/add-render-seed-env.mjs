import fs from "node:fs/promises";
const path = "C:/Users/Korisnik/Desktop/green-nest/render.yaml";
const source = await fs.readFile(path, "utf8");
const needle = `      - key: SWAGGER_ENABLED
        value: "false"`;
const replacement = `${needle}
      - key: SEED_ADMIN_PASSWORD
        sync: false`;
if (!source.includes(needle)) throw new Error("Render env insertion point not found");
await fs.writeFile(path, source.replace(needle, replacement), "utf8");
