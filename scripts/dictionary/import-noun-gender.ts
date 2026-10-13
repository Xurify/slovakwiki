/**
 * Write grammatical `gender` onto every `Nouns` row in content/dictionary/words.json
 * from Wiktionary Slovak extracts (kaikki.org, CC BY-SA). English Wiktionary first,
 * Polish Wiktionary for gaps and ties, confident ending rules last; anything else
 * stays unset and is listed for review. Mapping rules: `noun-gender-mapping.ts`.
 *
 * Dumps (gitignored, under tmp/):
 *   tmp/kaikki/kaikki-slovak.jsonl
 *     ← https://kaikki.org/dictionary/Slovak/kaikki.org-dictionary-Slovak.jsonl
 *   tmp/kaikki-polish/kaikki-polish-wiktionary-slovak.jsonl (optional, adds coverage)
 *     ← https://kaikki.org/plwiktionary/język słowacki/kaikki.org-dictionary-języksłowacki.jsonl
 *
 * Usage: bun scripts/dictionary/import-noun-gender.ts
 *        bun scripts/dictionary/import-noun-gender.ts -- --dry-run
 *        bun scripts/dictionary/import-noun-gender.ts -- --english-dump a.jsonl --polish-dump b.jsonl
 *
 * Report: tmp/noun-gender-report.json (unresolved, ending-rule, gloss-match,
 * Polish-only and edition-disagreement lemmas).
 * Curated seed nouns (words.ts / curated-essentials-seed.ts) are checked, not edited.
 */

import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

import { words } from "../../src/lib/catalog/entries";
import type { ContentEntry, NounGender } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";
import {
  resolveNounGender,
  type GenderResolution,
  type KaikkiNounRecord,
} from "./noun-gender-mapping";

type WordSeed = Pick<ContentEntry, "slug" | "slovak" | "english" | "category" | "gender">;

const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
const DEFAULT_ENGLISH_DUMP_PATH = path.join(ROOT, "tmp", "kaikki", "kaikki-slovak.jsonl");
const DEFAULT_POLISH_DUMP_PATH = path.join(
  ROOT,
  "tmp",
  "kaikki-polish",
  "kaikki-polish-wiktionary-slovak.jsonl",
);
const REPORT_PATH = path.join(ROOT, "tmp", "noun-gender-report.json");

/**
 * Reviewed corrections that win over both editions and ending rules.
 * Key: `slovak` lemma. `null` keeps gender unset on purpose.
 */
const HAND_OVERRIDES: Record<string, NounGender | null> = {
  // Homographs where our English gloss picks the person sense.
  člen: "masculine-animate",
  čitateľ: "masculine-animate",
  duch: "masculine-animate",
  manažér: "masculine-animate",
  sekretár: "masculine-animate",
  // Polish Wiktionary tags these masculine; both are neuter (vysvedčenie, mesto).
  oddelenie: "neuter",
  dejisko: "neuter",
  // Pluralia tantum missing from both editions.
  financie: "plural-only",
  kúpele: "plural-only",
  // Slang, in neither edition (curated seed).
  kšeft: "masculine-inanimate",
  // Lemma/gloss mismatch (cola vs "round" — likely a form of kolo); fix the row first.
  kola: null,
};

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function loadNounRecords(
  dumpPath: string,
): Promise<Map<string, KaikkiNounRecord[]>> {
  const byWord = new Map<string, KaikkiNounRecord[]>();
  const lines = createInterface({
    input: createReadStream(dumpPath, "utf8"),
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    if (!line.includes('"pos": "noun"') && !line.includes('"pos":"noun"')) continue;
    const record = JSON.parse(line) as KaikkiNounRecord;
    if (record.pos !== "noun") continue;
    const list = byWord.get(record.word) ?? [];
    list.push({
      word: record.word,
      pos: record.pos,
      tags: record.tags,
      head_templates: record.head_templates,
      senses: record.senses?.map((sense) => ({
        glosses: sense.glosses,
        tags: sense.tags,
      })),
    });
    byWord.set(record.word, list);
  }
  return byWord;
}

interface Editions {
  english: Map<string, KaikkiNounRecord[]>;
  polish: Map<string, KaikkiNounRecord[]>;
}

function recordsFor(
  lemma: string,
  byWord: Map<string, KaikkiNounRecord[]>,
): KaikkiNounRecord[] {
  return byWord.get(lemma) ?? byWord.get(lemma.toLocaleLowerCase("sk")) ?? [];
}

function resolve(
  word: Pick<WordSeed, "slovak" | "english">,
  editions: Editions,
): GenderResolution {
  const override = HAND_OVERRIDES[word.slovak];
  if (override) return { gender: override, source: "hand-override" };
  if (override === null) {
    return { gender: null, reason: "ambiguous", note: "hand override: left unset" };
  }
  return resolveNounGender(word.slovak, word.english, {
    english: recordsFor(word.slovak, editions.english),
    polish: recordsFor(word.slovak, editions.polish),
  });
}

/** Keep `gender` right after `category` so diffs and hand edits stay readable. */
function withGender<T extends WordSeed>(word: T, gender: NounGender | undefined): T {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(word)) {
    if (key === "gender") continue;
    next[key] = value;
    if (key === "category" && gender) next.gender = gender;
  }
  return next as T;
}

interface ReportRow {
  slug: string;
  slovak: string;
  english: string;
  gender?: NounGender;
  note?: string;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const englishDumpPath = path.resolve(
    argValue("--english-dump") ?? DEFAULT_ENGLISH_DUMP_PATH,
  );
  const polishDumpPath = path.resolve(
    argValue("--polish-dump") ?? DEFAULT_POLISH_DUMP_PATH,
  );

  if (!existsSync(englishDumpPath)) {
    console.error(
      `Missing English Wiktionary dump: ${path.relative(ROOT, englishDumpPath)}`,
    );
    console.error(
      "Download https://kaikki.org/dictionary/Slovak/kaikki.org-dictionary-Slovak.jsonl to tmp/kaikki/kaikki-slovak.jsonl",
    );
    process.exitCode = 1;
    return;
  }

  const editions: Editions = {
    english: await loadNounRecords(englishDumpPath),
    polish: existsSync(polishDumpPath)
      ? await loadNounRecords(polishDumpPath)
      : new Map<string, KaikkiNounRecord[]>(),
  };
  if (editions.polish.size === 0) {
    console.warn(
      `Polish Wiktionary dump not found (${path.relative(ROOT, polishDumpPath)}) — English Wiktionary only.`,
    );
  }
  const dictionaryWords = JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordSeed[];

  const counts: Record<string, number> = {};
  const byGender: Partial<Record<NounGender, number>> = {};
  const ruleDerived: ReportRow[] = [];
  const glossMatched: ReportRow[] = [];
  const polishOnly: ReportRow[] = [];
  const editionDisagreements: ReportRow[] = [];
  const unresolved: ReportRow[] = [];
  let nouns = 0;
  let changed = 0;

  const nextWords = dictionaryWords.map((word) => {
    if (word.category !== "Nouns") return word;
    nouns += 1;

    const resolution = resolve(word, editions);
    const row: ReportRow = {
      slug: word.slug,
      slovak: word.slovak,
      english: word.english,
      ...(resolution.gender ? { gender: resolution.gender } : {}),
      ...(resolution.note ? { note: resolution.note } : {}),
    };

    if (resolution.gender) {
      counts[resolution.source] = (counts[resolution.source] ?? 0) + 1;
      byGender[resolution.gender] = (byGender[resolution.gender] ?? 0) + 1;
      if (resolution.source === "ending-rule") ruleDerived.push(row);
      if (resolution.source === "english-wiktionary-gloss-match") glossMatched.push(row);
      if (resolution.source === "polish-wiktionary") polishOnly.push(row);
      if (resolution.note?.startsWith("Polish Wiktionary says")) {
        editionDisagreements.push(row);
      }
    } else {
      counts[resolution.reason] = (counts[resolution.reason] ?? 0) + 1;
      unresolved.push(row);
    }

    const gender = resolution.gender ?? undefined;
    if (word.gender !== gender) changed += 1;
    return withGender(word, gender);
  });

  // Curated seed nouns live in TS — report drift instead of rewriting source files.
  const curatedDrift: ReportRow[] = [];
  for (const entry of words) {
    if (entry.origin !== "curated" || entry.category !== "Nouns") continue;
    const resolution = resolve(entry, editions);
    if (resolution.gender !== (entry.gender ?? null)) {
      curatedDrift.push({
        slug: entry.slug,
        slovak: entry.slovak,
        english: entry.english,
        ...(resolution.gender ? { gender: resolution.gender } : {}),
        note: `seed has ${entry.gender ?? "no gender"}${resolution.note ? `; ${resolution.note}` : ""}`,
      });
    }
  }

  if (!dryRun) {
    await writeFile(WORDS_PATH, `${JSON.stringify(nextWords, null, 2)}\n`, "utf8");
  }
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(
    REPORT_PATH,
    `${JSON.stringify(
      {
        counts,
        byGender,
        ruleDerived,
        glossMatched,
        editionDisagreements,
        polishOnly,
        unresolved,
        curatedDrift,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const resolved = nouns - unresolved.length;
  const percent = nouns > 0 ? ((resolved / nouns) * 100).toFixed(1) : "0";
  console.log(`Nouns in words.json: ${nouns}`);
  console.log(`Resolved: ${resolved} (${percent}%) — ${JSON.stringify(counts)}`);
  console.log(`By gender: ${JSON.stringify(byGender)}`);
  console.log(`${dryRun ? "Would change" : "Changed"}: ${changed}`);

  const printRows = (title: string, rows: ReportRow[]) => {
    if (rows.length === 0) return;
    console.log(`\n${title} (${rows.length}):`);
    for (const row of rows) {
      console.log(
        `  ${row.slovak} (${row.slug}) — ${row.english}${row.gender ? ` → ${row.gender}` : ""}${row.note ? ` [${row.note}]` : ""}`,
      );
    }
  };
  printRows("Ending-rule genders (review)", ruleDerived);
  printRows("Homograph gloss matches (review)", glossMatched);
  printRows(
    "English and Polish Wiktionary disagree (English kept)",
    editionDisagreements,
  );
  printRows("Unresolved (gender unset)", unresolved);
  printRows("Curated seed drift (hand-edit the TS seed)", curatedDrift);

  console.log(
    `\nPolish Wiktionary only: ${polishOnly.length} (full list in the report file)`,
  );
  console.log(`→ ${path.relative(ROOT, REPORT_PATH)}`);
  if (!dryRun) console.log(`→ ${path.relative(ROOT, WORDS_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
