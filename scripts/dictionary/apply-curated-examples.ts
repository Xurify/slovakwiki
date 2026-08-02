/**
 * Merge hand-curated example sentences into promoted dictionary words.
 * Curated examples always win for a slug (replace Tatoeba / older curated).
 *
 * Usage: bun run examples:curate
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ContentEntry, Example } from "../../src/lib/content/types";
import { isCleanExample } from "../../src/lib/content/example-quality";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");
const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");

/** Extra related links when curated examples are applied. */
const CURATED_RELATED: Record<string, string[]> = {
  mat: ["byt", "rad", "moct"],
  rad: ["mat", "pacit", "lubit"],
  pacit: ["rad", "lubit", "mat"],
  lubit: ["rad", "pacit", "milovat"],
  volat: ["meno"],
  ist: ["chodit", "prist"],
  chodit: ["ist", "prist"],
  byt: ["mat", "bratislava", "ucitel"],
  vediet: ["nevediet"],
  dat: ["davat"],
  pozerat: ["vidiet"],
  vidiet: ["pozerat"],
  pocuvat: ["pocut"],
  pocut: ["pocuvat"],
  moct: ["musiet", "chciet"],
  musiet: ["moct", "chciet"],
  chciet: ["moct", "musiet"],
};

/** Gloss overrides applied with curated examples (search / detail headword). */
const CURATED_ENGLISH: Record<string, string> = {
  rad: "glad; (mať rád) to like",
};

async function main(): Promise<void> {
  const promoted = JSON.parse(await readFile(PROMOTED_PATH, "utf8")) as WordSeed[];
  const curated = JSON.parse(await readFile(CURATED_PATH, "utf8")) as Record<
    string,
    Example[]
  >;

  let filled = 0;
  let missingSlug = 0;

  for (const [slug, examples] of Object.entries(curated)) {
    const word = promoted.find((entry) => entry.slug === slug);
    if (!word) {
      missingSlug += 1;
      console.warn(`No promoted word for curated slug: ${slug}`);
      continue;
    }

    const clean = examples.filter((example) =>
      isCleanExample(example.slovak, example.english),
    );
    if (clean.length === 0) continue;

    word.examples = clean.map((example) => ({
      slovak: example.slovak,
      english: example.english,
      note: example.note ?? "Curated",
      ...(example.demonstrates ? { demonstrates: example.demonstrates } : {}),
    }));

    const english = CURATED_ENGLISH[slug];
    if (english) {
      word.english = english;
    }

    const related = CURATED_RELATED[slug];
    if (related) {
      word.related = related;
    }

    filled += 1;
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");
  console.log(`Applied curated examples to ${filled} words`);
  console.log(`Missing slugs: ${missingSlug}`);
  console.log(`→ ${path.relative(ROOT, PROMOTED_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
