import type { FrequencyEntry, FrequencyPos } from "./frequency-types";

const SNK_SOURCE_NAME = "Slovak National Corpus (SNK)";

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse an SNK top-1000 lemmas HTML table into frequency entries. */
export function parseSnkLemmaTable(
  html: string,
  pos: FrequencyPos,
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
      pos,
      count: Number.isFinite(count) ? count : undefined,
      source: SNK_SOURCE_NAME,
      sourceUrl,
    });
  }

  return entries.toSorted((a, b) => a.rank - b.rank);
}
