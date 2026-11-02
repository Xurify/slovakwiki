/**
 * Fill dictionary examples from Tatoeba's public search API (LangHarness,
 * 2026-11-01). The local dumps enrich-examples.ts reads (tmp/tatoeba/) are not
 * on every machine, so this asks the search API for each word and applies the
 * same gates: the sentence must hold the word (exampleContainsLemma), pass the
 * corpus-quality check, not be a sentence a reviewer rejected, and carry an
 * English translation.
 *
 * Verbs are not filled here. Searching a verb by stem returns homographs (the
 * stem of vládať, to rule, is also vláda, the government, and the matcher
 * takes it), and Tatoeba's Slovak corpus has few sentences for most verbs.
 * Lemmas on the frequency blocklist are skipped: the owner ruled them out.
 *
 *   bun scripts/dictionary/tatoeba-api-examples.ts <plan.json> [--dry]
 *
 * plan.json items: { mode: "new" | "topup", slovak, english, category, gender?, slug? }
 *   new    adds a row to content/dictionary/words.json (slug from lemmaToSlug);
 *          if a row with the same spelling but other diacritics exists, it is
 *          topped up instead
 *   topup  appends sentences to the existing row named by slug
 *
 * Raw API responses are cached in tmp/tatoeba-api/ (gitignored): a rerun costs
 * nothing, and an interrupted run resumes where it stopped.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { EXAMPLE_STORE_PER_WORD } from "../../src/lib/catalog/dictionary/example-limits";
import {
  exampleContainsLemma,
  lemmaAppearsAsToken,
} from "../../src/lib/catalog/dictionary/example-lemma-match";
import { isAcceptableCorpusExample } from "../../src/lib/catalog/dictionary/example-quality";
import { lemmaToSlug, normalizeLemma } from "../../src/lib/catalog/frequency";
import { FREQUENCY_PUBLISH_BLOCKLIST } from "../../src/lib/catalog/frequency/blocklist";
import type { Example } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";

const API = "https://tatoeba.org/en/api_v0/search";
const CACHE = path.join(ROOT, "tmp", "tatoeba-api");
const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
const REJECTED_PATH = path.join(ROOT, "content", "dictionary", "tatoeba-rejected.json");
const LEMMA_REJECTED_PATH = path.join(
  ROOT,
  "content",
  "dictionary",
  "tatoeba-lemma-rejected.json",
);
/** The API gives ten sentences a page. Five pages is fifty sentences to choose from. */
const MAX_PAGES = 5;
/** Be polite to the public API: one uncached request every 600 ms. */
const DELAY_MS = 600;

interface PlanItem {
  mode: "new" | "topup";
  slovak: string;
  english: string;
  category: string;
  gender?: string;
  slug?: string;
}
interface Row {
  slug: string;
  slovak: string;
  english: string;
  category: string;
  gender?: string;
  examples: Example[];
  related: string[];
}
interface ApiSentence {
  id: number;
  text: string;
  lang: string;
  translations?: Array<Array<{ id: number; text: string; lang: string }>>;
}
interface Pair {
  tatoebaId: number;
  slovak: string;
  english: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const dry = process.argv.includes("--dry");
const planArg = process.argv.find((arg) => arg.endsWith(".json"));
if (!planArg) throw new Error("usage: tatoeba-api-examples.ts <plan.json> [--dry]");

async function fetchPage(query: string, page: number): Promise<ApiSentence[]> {
  const url = `${API}?from=slk&query=${encodeURIComponent(query)}&trans_to=eng&trans_filter=limit&page=${page}`;
  const file = path.join(CACHE, `${createHash("sha1").update(url).digest("hex")}.json`);
  let body: string;
  try {
    body = await readFile(file, "utf8");
  } catch {
    await sleep(DELAY_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": "slovakwiki-dictionary-fill (one-off, local)" },
    });
    // Past the last page the API answers 404: that is the end of the results.
    if (res.status === 404) body = JSON.stringify({ results: [] });
    else if (!res.ok)
      throw new Error(`Tatoeba ${res.status} for "${query}" page ${page}`);
    else body = await res.text();
    await mkdir(CACHE, { recursive: true });
    await writeFile(file, body, "utf8");
  }
  return (JSON.parse(body) as { results?: ApiSentence[] }).results ?? [];
}

/** Slovak sentences that have an English translation, as the pipeline's pairs. */
function pairsOf(results: ApiSentence[]): Pair[] {
  const out: Pair[] = [];
  for (const sentence of results) {
    if (sentence.lang !== "slk") continue;
    const english = (sentence.translations ?? []).flat().find((t) => t.lang === "eng");
    if (english)
      out.push({ tatoebaId: sentence.id, slovak: sentence.text, english: english.text });
  }
  return out;
}

/** The same preferences as enrich-examples.ts: a sentence of ordinary length,
 *  the lemma as a whole token, a full stop, a capital letter. */
function scorePair(pair: Pair, lemma: string): number {
  let score = 0;
  const length = pair.slovak.length;
  if (length >= 12 && length <= 90) score += 3;
  else if (length <= 120) score += 1;
  if (lemmaAppearsAsToken(pair.slovak, lemma)) score += 8;
  if (/[.!?]$/.test(pair.slovak.trim())) score += 1;
  if (/^[A-ZÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ]/.test(pair.slovak.trim())) score += 1;
  return score;
}

async function main(): Promise<void> {
  const plan = JSON.parse(await readFile(path.resolve(planArg!), "utf8")) as PlanItem[];
  const words = JSON.parse(await readFile(WORDS_PATH, "utf8")) as Row[];
  const rejected = new Set(
    Object.keys(
      JSON.parse(await readFile(REJECTED_PATH, "utf8")) as Record<string, string>,
    ).map(Number),
  );
  const lemmaRejected = new Set(
    Object.keys(
      JSON.parse(await readFile(LEMMA_REJECTED_PATH, "utf8")) as Record<string, string>,
    ),
  );
  const report = ["mode\tslug\tword\tquery\tpages\taccepted\tadded\tstatus"];
  const totals = { newWords: 0, toppedUp: 0, sentences: 0, none: 0, skipped: 0 };

  for (const item of plan) {
    let mode: "new" | "topup" = item.mode;
    const sk = item.slovak.toLocaleLowerCase("sk");
    let row =
      mode === "topup"
        ? words.find((w) => w.slug === item.slug)
        : words.find((w) => w.slovak.toLocaleLowerCase("sk") === sk);
    if (mode === "new" && !row) {
      // Same spelling, other diacritics ("prima" for "príma"): top that row up.
      const same = words.find(
        (w) => normalizeLemma(w.slovak) === normalizeLemma(item.slovak),
      );
      if (same) {
        mode = "topup";
        row = same;
      }
    }
    const skip = (why: string) => {
      totals.skipped += 1;
      report.push(
        `${mode}\t${item.slug ?? lemmaToSlug(item.slovak)}\t${item.slovak}\t-\t0\t0\t0\tskipped: ${why}`,
      );
      console.log(`skip   ${item.slovak.padEnd(14)} ${why}`);
    };
    if (item.category === "Verbs") {
      skip("verbs are not filled here (see the header)");
      continue;
    }
    if (FREQUENCY_PUBLISH_BLOCKLIST.has(item.slovak.toLocaleLowerCase("sk"))) {
      skip("on the frequency blocklist, which the owner ruled out");
      continue;
    }
    if (mode === "new" && row) {
      skip("a row already exists");
      continue;
    }
    if (mode === "topup" && !row) {
      skip("no row to top up");
      continue;
    }
    const slug = mode === "new" ? lemmaToSlug(item.slovak) : row!.slug;
    if (mode === "new" && words.some((w) => w.slug === slug)) {
      skip(`slug ${slug} is taken`);
      continue;
    }

    const have = row?.examples ?? [];
    // A row that already has its eight still gets three more when the lexicon
    // finds fewer than three of them usable (its cloze did not match).
    const need =
      mode === "topup" && have.length >= EXAMPLE_STORE_PER_WORD
        ? 3
        : EXAMPLE_STORE_PER_WORD - have.length;
    if (need <= 0) {
      skip("already has enough sentences");
      continue;
    }

    const lemma = item.slovak;
    const haveIds = new Set(
      have.map((e) => e.tatoebaId).filter((id): id is number => typeof id === "number"),
    );
    const accept = (pair: Pair) =>
      !rejected.has(pair.tatoebaId) &&
      !lemmaRejected.has(`${slug}#${pair.tatoebaId}`) &&
      !haveIds.has(pair.tatoebaId) &&
      isAcceptableCorpusExample(pair.slovak, pair.english) &&
      exampleContainsLemma(pair.slovak, lemma, item.category, item.gender);

    const found: Pair[] = [];
    let pages = 0;
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const results = await fetchPage(lemma, page);
      pages = page;
      if (results.length === 0) break;
      found.push(...pairsOf(results));
      // Enough candidates to choose the best from: stop paging.
      if (found.filter(accept).length >= need * 3) break;
    }

    const accepted = found.filter(accept);
    const picked: Example[] = [];
    const seen = new Set<string>();
    for (const pair of [...accepted].sort(
      (a, b) => scorePair(b, lemma) - scorePair(a, lemma),
    )) {
      const key = normalizeLemma(pair.slovak);
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push({
        slovak: pair.slovak,
        english: pair.english,
        note: "Tatoeba",
        tatoebaId: pair.tatoebaId,
      });
      if (picked.length >= need) break;
    }

    const status = picked.length ? "ok" : "none";
    report.push(
      `${mode}\t${slug}\t${item.slovak}\t${lemma}\t${pages}\t${accepted.length}\t${picked.length}\t${status}`,
    );
    console.log(
      `${mode.padEnd(6)} ${item.slovak.padEnd(14)} pages=${pages} accepted=${accepted.length} added=${picked.length}`,
    );
    if (dry)
      for (const p of picked.slice(0, 2))
        console.log(`         ${p.slovak}  /  ${p.english}`);
    if (picked.length === 0) {
      totals.none += 1;
      continue;
    }
    totals.sentences += picked.length;
    if (mode === "new") {
      totals.newWords += 1;
      if (!dry)
        words.push({
          slug,
          slovak: item.slovak,
          english: item.english,
          category: item.category,
          ...(item.gender ? { gender: item.gender } : {}),
          examples: picked,
          related: [],
        });
    } else {
      totals.toppedUp += 1;
      if (!dry) row!.examples = [...have, ...picked];
    }
  }

  await mkdir(CACHE, { recursive: true });
  await writeFile(
    path.join(CACHE, dry ? "report-dry.tsv" : "report.tsv"),
    report.join("\n") + "\n",
    "utf8",
  );
  if (!dry) await writeFile(WORDS_PATH, JSON.stringify(words, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ dry, ...totals }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
