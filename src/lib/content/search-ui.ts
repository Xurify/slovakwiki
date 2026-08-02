/**
 * Lightweight search chrome for client islands.
 * Keep this free of `$lib/content/data` so Header/SearchBox do not ship the dictionary.
 */

export type SearchDocKind =
  "word" | "grammar" | "pronunciation" | "case" | "lesson" | "practice";

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .trim();
}

export const searchKindLabels: Record<SearchDocKind, string> = {
  word: "Word",
  grammar: "Grammar",
  pronunciation: "Pronunciation",
  case: "Case",
  lesson: "Lesson",
  practice: "Practice",
};

export const searchKindChips: SearchDocKind[] = [
  "word",
  "grammar",
  "case",
  "pronunciation",
  "lesson",
  "practice",
];

/** EN topic labels: first letter up; SK lemmas stay as stored. */
export function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toLocaleUpperCase("en") + value.slice(1);
}

/**
 * Idle “Try” chips. Hardcoded so client search UI never imports the full corpus.
 * Keep labels/hrefs in sync with live content when those pages rename.
 */
export const searchIdleHints: Array<{
  href: string;
  kind: SearchDocKind;
  label: string;
  lang?: string;
}> = [
  {
    label: "ahoj",
    kind: "word",
    href: "/dictionary/ahoj",
    lang: "sk",
  },
  {
    label: "ďakujem",
    kind: "word",
    href: "/dictionary/dakujem",
    lang: "sk",
  },
  {
    label: "Nominative",
    kind: "case",
    href: "/grammar/cases/nominative",
  },
  {
    label: "Meet someone",
    kind: "lesson",
    href: "/lessons/everyday/meet-someone",
  },
  {
    label: "First-syllable stress",
    kind: "pronunciation",
    href: "/pronunciation/first-syllable-stress",
  },
];
