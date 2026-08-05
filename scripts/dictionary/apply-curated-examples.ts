/**
 * Merge hand-curated example sentences into dictionary words.
 *
 * Corpus-first policy:
 * - Reviewed curated / pattern (`demonstrates`) examples always win.
 * - Practice frames only fill empty or underfilled (<2) slots.
 * - Never replace Tatoeba/hand rows wholesale with practice frames.
 * - Pattern lemmas: curated pedagogy rows lead; existing Tatoeba extras kept (store pool).
 * - Non-pattern applies union-merge so enrich appends survive.
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

const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
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
  bat: ["pes"],
  stat: ["stat-v", "byt", "ucitel"],
  "stat-v": ["stat"],
  hladat: ["najst"],
  najst: ["hladat"],
  zacat: ["prestat"],
  prestat: ["zacat"],
  povedat: ["hovorit"],
  prist: ["odist", "ist", "chodit"],
  odist: ["prist", "ist"],
  dostat: ["dat", "davat"],
  robit: ["urobit"],
  urobit: ["robit"],
  brat: ["vziat"],
  vziat: ["brat"],
  pisat: ["napisat"],
  napisat: ["pisat"],
  citat: ["precitat"],
  precitat: ["citat"],
  kupovat: ["kupit"],
  kupit: ["kupovat"],
  jest: ["zjest"],
  zjest: ["jest"],
  pit: ["vypit"],
  vypit: ["pit"],
  pripustit: ["priznat", "priznavat"],
};

/** Gloss overrides applied with curated examples (search / detail headword). */
const CURATED_ENGLISH: Record<string, string> = {
  rad: "glad; (mať rád) to like",
};

function normalizeExamples(examples: Example[]): Example[] {
  return examples.map((example) => ({
    slovak: example.slovak,
    english: example.english,
    note: example.note ?? "Curated",
    ...(example.demonstrates ? { demonstrates: example.demonstrates } : {}),
    ...(example.isPracticeFrame ? { isPracticeFrame: true } : {}),
    ...(example.tatoebaId ? { tatoebaId: example.tatoebaId } : {}),
  }));
}

function isPracticeOnly(examples: Example[]): boolean {
  return (
    examples.length > 0 && examples.every((example) => example.isPracticeFrame === true)
  );
}

function hasTatoeba(examples: Example[]): boolean {
  return examples.some((example) => example.note === "Tatoeba");
}

function isReviewedCurated(examples: Example[]): boolean {
  return examples.some(
    (example) => example.demonstrates || example.isPracticeFrame !== true,
  );
}

async function main(): Promise<void> {
  const dictionaryWords = JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordSeed[];
  const curated = JSON.parse(await readFile(CURATED_PATH, "utf8")) as Record<
    string,
    Example[]
  >;

  let filled = 0;
  let skippedCorpus = 0;
  let missingSlug = 0;

  for (const [slug, examples] of Object.entries(curated)) {
    const word = dictionaryWords.find((entry) => entry.slug === slug);
    if (!word) {
      missingSlug += 1;
      console.warn(`No dictionary word for curated slug: ${slug}`);
      continue;
    }

    const clean = examples.filter((example) =>
      isCleanExample(example.slovak, example.english),
    );
    if (clean.length === 0) continue;

    const incoming = normalizeExamples(clean);
    const reviewed = isReviewedCurated(incoming);
    const practiceOnly = isPracticeOnly(incoming);
    const underfilled = word.examples.length < 2;
    const patternLocked = incoming.some((example) => Boolean(example.demonstrates));

    // Practice frames must not replace corpus/hand rows — but may top up underfilled.
    if (practiceOnly && !underfilled && (hasTatoeba(word.examples) || !reviewed)) {
      if (hasTatoeba(word.examples) || !isPracticeOnly(word.examples)) {
        skippedCorpus += 1;
        continue;
      }
    }

    if (patternLocked) {
      // Curated pedagogy leads; keep non-pattern extras (usually Tatoeba store pool).
      const curatedKeys = new Set(
        incoming.map((example) => example.slovak.toLocaleLowerCase("sk")),
      );
      const extras = word.examples.filter((example) => {
        const key = example.slovak.toLocaleLowerCase("sk");
        if (curatedKeys.has(key)) return false;
        if (example.demonstrates) return false;
        return true;
      });
      word.examples = [...incoming, ...extras];
    } else if (reviewed && !practiceOnly) {
      // Hand-curated / reviewed rows lead; drop leftover practice frames from live.
      const curatedKeys = new Set(
        incoming.map((example) => example.slovak.toLocaleLowerCase("sk")),
      );
      const extras = word.examples.filter((example) => {
        if (example.isPracticeFrame) return false;
        const key = example.slovak.toLocaleLowerCase("sk");
        return !curatedKeys.has(key);
      });
      word.examples = [...incoming, ...extras];
    } else {
      // Union by Slovak text: keep live rows first, then curated/fill extras.
      const merged: Example[] = [];
      const seen = new Set<string>();
      for (const example of [...word.examples, ...incoming]) {
        const key = example.slovak.toLocaleLowerCase("sk");
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(example);
      }
      word.examples = merged;
    }

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

  await writeFile(WORDS_PATH, `${JSON.stringify(dictionaryWords, null, 2)}\n`, "utf8");
  console.log(`Applied curated examples to ${filled} words`);
  console.log(`Skipped practice frames over Tatoeba: ${skippedCorpus}`);
  console.log(`Missing slugs: ${missingSlug}`);
  console.log(`→ ${path.relative(ROOT, WORDS_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
