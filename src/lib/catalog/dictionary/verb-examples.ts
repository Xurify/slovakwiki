/**
 * Prefer conjugated verb forms in dictionary example order.
 * Citation infinitive after modals (`nemusíš sa ospravedlňovať`) is valid but
 * should not crowd out `ospravedlňujem sa` / past in the display slice.
 */

import { isWeakFillTemplate } from "./example-quality";
import { normalizeLemma } from "../frequency";
import { conjugateVerbForTest, searchFormsForLemma } from "../search/forms";
import type { Example } from "../types";

/** Keep these first sentences (valency / hand review). Conjugated rows follow. */
export const PIN_FIRST_VERB_SLUGS = new Set([
  "ocitnut",
  "podielat",
  "stretavat",
  "zavisiet",
  "vracat",
  "oznacit",
  "nemoct",
]);

const TOKEN_RE = /[\p{L}\p{M}]+/gu;

function tokenize(text: string): string[] {
  return (text.match(TOKEN_RE) ?? []).map((token) => token.toLocaleLowerCase("sk"));
}

function tokenSet(text: string): Set<string> {
  const keys = new Set<string>();
  for (const token of tokenize(text)) {
    keys.add(token);
    keys.add(normalizeLemma(token));
  }
  return keys;
}

function iaPresentForms(lemma: string): string[] {
  const lower = lemma.toLocaleLowerCase("sk");
  if (!lower.endsWith("ať") || lower.endsWith("ovať") || lower.endsWith("ávať")) {
    return [];
  }
  const stem = lower.slice(0, -2);
  return ["iam", "iaš", "ia", "iame", "iate"].map((ending) => `${stem}${ending}`);
}

function verbStem(lemma: string): string {
  const lower = lemma.toLocaleLowerCase("sk").replace(/\s+s[ai]$/u, "");
  if (lower.endsWith("ovať") || lower.endsWith("ávať")) return lower.slice(0, -4);
  if (lower.endsWith("núť") || lower.endsWith("ieť")) return lower.slice(0, -3);
  if (lower.endsWith("ť") && lower.length >= 4) return lower.slice(0, -2);
  return lower;
}

/** True when a non-citation inflected form of the verb appears as a token. */
export function exampleShowsConjugatedLemma(slovak: string, lemma: string): boolean {
  const bareLemma = lemma.toLocaleLowerCase("sk").replace(/\s+s[ai]$/u, "");
  const citation = new Set([
    lemma.toLocaleLowerCase("sk"),
    normalizeLemma(lemma),
    bareLemma,
    normalizeLemma(bareLemma),
  ]);
  const keys = new Set<string>();
  for (const form of [...searchFormsForLemma(lemma, "Verbs"), ...iaPresentForms(lemma)]) {
    const lower = form.toLocaleLowerCase("sk");
    const bare = lower.replace(/\s+s[ai]$/u, "");
    for (const candidate of [lower, bare, normalizeLemma(form), normalizeLemma(bare)]) {
      if (!candidate || citation.has(candidate)) continue;
      keys.add(candidate);
    }
  }

  const tokens = tokenSet(slovak);
  for (const key of keys) {
    if (tokens.has(key)) return true;
  }

  const stem = verbStem(lemma);
  if (stem.length < 4) return false;
  for (const token of tokenize(slovak)) {
    if (citation.has(token) || citation.has(normalizeLemma(token))) continue;
    if (token.startsWith(stem) && token.length > stem.length) return true;
  }

  return false;
}

const PRESENT_BUCKETS = [
  "pres-sg1",
  "pres-sg2",
  "pres-sg3",
  "pres-pl1",
  "pres-pl2",
  "pres-pl3",
] as const;

export type VerbFormBucket = (typeof PRESENT_BUCKETS)[number] | "past" | "inf" | "other";

function isPastForm(form: string): boolean {
  return /l[aoi]?$/u.test(form) && !/(em|ám|ím|iam)$/u.test(form);
}

function formBucketMap(lemma: string): Map<string, VerbFormBucket> {
  const map = new Map<string, VerbFormBucket>();
  let presentIndex = 0;
  for (const form of [...searchFormsForLemma(lemma, "Verbs"), ...iaPresentForms(lemma)]) {
    const bare = form.toLocaleLowerCase("sk").replace(/\s+s[ai]$/u, "");
    if (!bare) continue;
    if (isPastForm(bare)) {
      map.set(bare, "past");
      map.set(normalizeLemma(bare), "past");
      continue;
    }
    const bucket = PRESENT_BUCKETS[presentIndex % PRESENT_BUCKETS.length]!;
    presentIndex += 1;
    map.set(bare, bucket);
    map.set(normalizeLemma(bare), bucket);
  }
  return map;
}

/** Which inflected slot a sentence demonstrates (`pres-sg1`, `past`, `inf`, …). */
export function exampleFormBucket(slovak: string, lemma: string): VerbFormBucket {
  const map = formBucketMap(lemma);
  const bareLemma = lemma.toLocaleLowerCase("sk").replace(/\s+s[ai]$/u, "");
  const citation = new Set([
    lemma.toLocaleLowerCase("sk"),
    normalizeLemma(lemma),
    bareLemma,
    normalizeLemma(bareLemma),
  ]);

  let found: VerbFormBucket | null = null;
  for (const token of tokenize(slovak)) {
    if (citation.has(token) || citation.has(normalizeLemma(token))) continue;
    const bucket = map.get(token) ?? map.get(normalizeLemma(token));
    if (!bucket) continue;
    if (bucket === "pres-sg1" && found && found !== "pres-sg1") continue;
    found = bucket;
    if (bucket !== "pres-sg1") break;
  }

  if (found) return found;
  if (exampleShowsConjugatedLemma(slovak, lemma)) return "other";
  return "inf";
}

function diversifyConjugated<T extends Example>(examples: T[], lemma: string): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  const repeated: T[] = [];
  for (const example of examples) {
    const bucket = exampleFormBucket(example.slovak, lemma);
    if (!seen.has(bucket)) {
      seen.add(bucket);
      unique.push(example);
    } else {
      repeated.push(example);
    }
  }
  return [...unique, ...repeated];
}

export function orderVerbExamples<T extends Example>(examples: T[], lemma: string): T[] {
  const pattern: T[] = [];
  const conjugated: T[] = [];
  const rest: T[] = [];

  for (const example of examples) {
    if (example.demonstrates) {
      pattern.push(example);
    } else if (exampleShowsConjugatedLemma(example.slovak, lemma)) {
      conjugated.push(example);
    } else {
      rest.push(example);
    }
  }

  const uniqueBuckets = new Set(
    conjugated.map((example) => exampleFormBucket(example.slovak, lemma)),
  );
  if (uniqueBuckets.size >= 3 || rest.length === 0) {
    return [...pattern, ...diversifyConjugated(conjugated, lemma), ...rest];
  }

  const diversified = diversifyConjugated(conjugated, lemma);
  const lead = diversified.slice(0, 2);
  const leftover = diversified.slice(2);
  return [...pattern, ...lead, ...rest, ...leftover];
}

function cap(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLocaleUpperCase("sk") + text.slice(1);
}

function isObjectToStub(example: Example, lemma: string): boolean {
  if (example.demonstrates || example.note !== "Curated") return false;
  const sg1 = conjugateVerbForTest(lemma)[0];
  if (!sg1) return false;
  return example.slovak === `${cap(sg1)} to.`;
}

/** Reorder real examples. Never mint stamp sentences. Never bump a pinned first sentence. */
export function arrangeVerbExamples<T extends Example>(
  examples: T[],
  lemma: string,
  _english: string,
  slug: string,
): T[] {
  const stripped = examples.filter(
    (example) => !isWeakFillTemplate(example, lemma) && !isObjectToStub(example, lemma),
  );
  const pinFirst = PIN_FIRST_VERB_SLUGS.has(slug) && stripped[0];
  const pinned = pinFirst ? stripped[0]! : null;
  const pool = pinned
    ? stripped.filter((example) => example.slovak !== pinned.slovak)
    : stripped;
  const ordered = orderVerbExamples(pool, lemma);
  return pinned ? [pinned, ...ordered] : ordered;
}
