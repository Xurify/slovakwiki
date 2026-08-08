import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildDictionaryIndexSidecar } from "../../src/lib/content/dictionary-browse";

export async function writeDictionaryIndex(outputs: string[]): Promise<{
  bytes: number;
  entryCount: number;
}> {
  const payload = buildDictionaryIndexSidecar();
  const json = JSON.stringify(payload);
  const bytes = Buffer.byteLength(json, "utf8");

  for (const output of outputs) {
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, json, "utf8");
  }

  return { bytes, entryCount: payload.length };
}

const isMain = import.meta.main ?? process.argv[1]?.endsWith("export-index.ts");

if (isMain) {
  const outputs = [path.join(process.cwd(), "static", "dictionary", "index.json")];
  const { entryCount } = await writeDictionaryIndex(outputs);
  console.log(`Wrote ${entryCount} entries to ${outputs.join(", ")}`);
}
