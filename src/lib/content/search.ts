import { allEntries } from "./data";
import type { ContentEntry } from "./types";

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .trim();
}

export function searchEntries(query: string): ContentEntry[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return allEntries
    .map((entry) => {
      const title = normalizeSearchText(`${entry.slovak} ${entry.english}`);
      const searchable = normalizeSearchText(
        [
          entry.slovak,
          entry.english,
          entry.summary,
          entry.category,
          ...entry.tags,
          ...(entry.aliases ?? []),
        ].join(" ")
      );
      const score = title.startsWith(normalizedQuery)
        ? 3
        : title.includes(normalizedQuery)
          ? 2
          : searchable.includes(normalizedQuery)
            ? 1
            : 0;
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.entry);
}
