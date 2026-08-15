import type { FrequencyEntry, FrequencyPartOfSpeech } from "./types";

const SNK_SOURCE_NAME = "Slovak National Corpus (SNK)";

/** Small set of capitalized geographic/national lemmas worth retaining. */
export const PROPER_NOUN_ALLOWLIST: ReadonlySet<string> = new Set([
  "Slovensko",
  "Bratislava",
  "Česko",
  "Európa",
  "Nemecko",
  "Rakúsko",
  "Poľsko",
  "Maďarsko",
  "Viedeň",
  "Praha",
  "Košice",
  "Žilina",
  "Prešov",
  "Nitra",
  "Trnava",
  "Banská Bystrica",
  "USA",
  "EÚ",
]);

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse an SNK top-1000 lemmas HTML table into frequency entries. */
export function parseSnkLemmaTable(
  html: string,
  partOfSpeech: FrequencyPartOfSpeech,
  sourceUrl: string,
): FrequencyEntry[] {
  const rows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)];
  const entries: FrequencyEntry[] = [];

  for (const row of rows) {
    const cells = [...row[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) =>
      stripTags(match[1] ?? ""),
    );

    if (cells.length < 2) continue;
    if (cells[0] === "Nr." || cells[0] === "N.") continue;

    const rank = Number(cells[0]);
    const lemma = cells[1] ?? "";
    const count = cells[2] ? Number(cells[2].replace(/\s/g, "")) : undefined;

    if (!Number.isFinite(rank) || !lemma) continue;
    if (lemma.trim().length <= 1) continue;

    entries.push({
      rank,
      lemma,
      partOfSpeech,
      count: Number.isFinite(count) ? count : undefined,
      source: SNK_SOURCE_NAME,
      sourceUrl,
    });
  }

  return entries.toSorted((a, b) => a.rank - b.rank);
}

/** Parse SNK's count + lemma dump format into provisional ranked entries. */
export function parseSnkCountLemmaDump(
  text: string,
  partOfSpeech: FrequencyPartOfSpeech,
  sourceUrl: string,
): FrequencyEntry[] {
  const entries: FrequencyEntry[] = [];

  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^(\d+)\s+(.+?)\s*$/);
    if (!match) continue;

    const count = Number(match[1]);
    const lemma = match[2] ?? "";
    if (!Number.isFinite(count) || lemma.length <= 1) continue;

    entries.push({
      rank: 0,
      lemma,
      partOfSpeech,
      count,
      source: SNK_SOURCE_NAME,
      sourceUrl,
    });
  }

  return entries
    .toSorted((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function isLikelyProperNoun(lemma: string): boolean {
  const trimmed = lemma.trim();
  const firstLetter = [...trimmed].find((character) => /\p{L}/u.test(character));
  if (!firstLetter) return false;

  const letters = [...trimmed].filter((character) => /\p{L}/u.test(character));
  const startsUppercase =
    firstLetter === firstLetter.toLocaleUpperCase("sk") &&
    firstLetter !== firstLetter.toLocaleLowerCase("sk");
  const isAllCaps =
    letters.length === 1 ||
    letters.every((character) => character === character.toLocaleUpperCase("sk"));

  return startsUppercase && !isAllCaps;
}

export function selectFrequencyHead(
  entries: FrequencyEntry[],
  limit: number,
  options: { skipProperNouns?: boolean } = {},
): FrequencyEntry[] {
  const filtered = options.skipProperNouns
    ? entries.filter(
        (entry) =>
          !isLikelyProperNoun(entry.lemma) || PROPER_NOUN_ALLOWLIST.has(entry.lemma),
      )
    : entries;

  return filtered
    .toSorted((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, Math.max(0, limit))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
