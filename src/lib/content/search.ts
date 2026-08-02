import { allEntries } from "./data";
import { searchFormsForLemma } from "./search-forms";
import { normalizeSearchText } from "./search-ui";
import type { ContentEntry } from "./types";

export { normalizeSearchText } from "./search-ui";

export function searchEntries(query: string): ContentEntry[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return allEntries
    .map((entry) => {
      const title = normalizeSearchText(`${entry.slovak} ${entry.english}`);
      const forms =
        entry.kind === "word" ? searchFormsForLemma(entry.slovak, entry.category) : [];
      const formHit = forms.some((form) => normalizeSearchText(form) === normalizedQuery);
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
      const score = title.startsWith(normalizedQuery)
        ? 4
        : title.includes(normalizedQuery)
          ? 3
          : formHit
            ? 2
            : searchable.includes(normalizedQuery)
              ? 1
              : 0;

      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .toSorted((first, second) => second.score - first.score)
    .map((result) => result.entry);
}
