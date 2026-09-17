import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/Korisnik/Downloads/rasadnik za sajt (1).xlsx";
const outputDir = "C:/Users/Korisnik/Desktop/green-nest/.tmp-spreadsheet";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

const summary = await workbook.inspect({
  kind: "workbook,sheet,table,region",
  maxChars: 30000,
  tableMaxRows: 80,
  tableMaxCols: 30,
  tableMaxCellChars: 500,
});
console.log(summary.ndjson);

const sheets = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 4000 });
for (const line of sheets.ndjson.split("\n").filter(Boolean)) {
  const row = JSON.parse(line);
  if (!row.name) continue;
  const preview = await workbook.render({
    sheetName: row.name,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  const safeName = row.name.replace(/[^a-z0-9_-]+/gi, "-");
  await fs.writeFile(`${outputDir}/${safeName}.png`, new Uint8Array(await preview.arrayBuffer()));
}
