import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { ROOT } from "../lib/paths";

const SNK_CACHE_DIR = path.join(ROOT, "tmp", "snk");
const SNK_BASE = "https://korpus.juls.savba.sk/files/prim-8.0/tag";
/** Every part-of-speech tag in the public SNK form lists. */
const SNK_TAGS = [
  "0",
  "A",
  "D",
  "E",
  "G",
  "J",
  "N",
  "O",
  "P",
  "R",
  "S",
  "T",
  "V",
  "W",
  "Z",
];

const require = createRequire(import.meta.url);
const Bunzip = require("seek-bzip") as { decode(input: Buffer): Buffer };

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Lower-cased word form → corpus count, summed over every part of speech. */
export async function loadSnkFormCounts(): Promise<Map<string, number>> {
  await mkdir(SNK_CACHE_DIR, { recursive: true });
  const counts = new Map<string, number>();

  for (const tag of SNK_TAGS) {
    const file = `prim-8.0-public-all-${tag}-word-frequency.bz2`;
    const cachePath = path.join(SNK_CACHE_DIR, file);
    if (!(await fileExists(cachePath))) {
      console.log(
        `Downloading SNK ${tag} word forms → ${path.relative(ROOT, cachePath)}`,
      );
      const response = await fetch(`${SNK_BASE}/${file}`);
      if (!response.ok) throw new Error(`SNK ${file}: HTTP ${response.status}`);
      await writeFile(cachePath, Buffer.from(await response.arrayBuffer()));
    }

    const text = Bunzip.decode(await readFile(cachePath)).toString("utf8");
    for (const line of text.split("\n")) {
      const match = /^\s*(\d+)\s+(.+?)\s*$/u.exec(line);
      if (!match) continue;
      const form = (match[2] ?? "").toLocaleLowerCase("sk");
      counts.set(form, (counts.get(form) ?? 0) + Number(match[1]));
    }
  }

  console.log(`SNK word forms: ${counts.size.toLocaleString("en")}`);
  return counts;
}
