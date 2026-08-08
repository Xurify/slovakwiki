import { allEntries } from "./data";
import { searchFormsForLemma } from "./search-forms";
import { normalizeSearchText } from "./search-ui";
import type { ContentEntry } from "./types";

export { normalizeSearchText } from "./search-ui";

function englishGlossTokens(english: string): string[] {
  return english
    .split(";")
    .flatMap((segment) => segment.split(/\s+/))
    .map((token) => normalizeSearchText(token.trim()))
    .filter(Boolean);
}

function scoreWordEntry(
  entry: ContentEntry,
  normalizedQuery: string,
  forms: string[],
): number {
  const title = normalizeSearchText(`${entry.slovak} ${entry.english}`);
  const slovak = normalizeSearchText(entry.slovak);
  const normalizedForms = forms.map((form) => normalizeSearchText(form));
  const glosses = englishGlossTokens(entry.english);

  if (title.startsWith(normalizedQuery)) {
    return 4;
  }

  if (title.includes(normalizedQuery)) {
    return 3;
  }

  if (slovak === normalizedQuery || normalizedForms.includes(normalizedQuery)) {
    return 4;
  }

  if (
    slovak.startsWith(normalizedQuery) ||
    normalizedForms.some((f) => f.startsWith(normalizedQuery))
  ) {
    return 3;
  }

  if (forms.some((form) => normalizeSearchText(form) === normalizedQuery)) {
    return 2;
  }

  if (glosses.some((gloss) => gloss === normalizedQuery)) {
    return 2;
  }

  if (normalizedQuery.length > 3) {
    const searchable = normalizeSearchText(
      [
        entry.slovak,
        entry.english,
        entry.summary,
        entry.category,
        ...entry.tags,
        ...(entry.aliases ?? []),
        ...forms,
      ].join(" "),
    );
    if (searchable.includes(normalizedQuery)) {
      return 1;
    }
  }

  return 0;
}

export function searchEntries(query: string): ContentEntry[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return allEntries
    .map((entry) => {
      const forms =
        entry.kind === "word" ? searchFormsForLemma(entry.slovak, entry.category) : [];
      const score = scoreWordEntry(entry, normalizedQuery, forms);

      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .toSorted((first, second) => second.score - first.score)
    .map((result) => result.entry);
}
