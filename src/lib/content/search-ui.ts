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

/** Compact right-rail labels for dictionary categories (avoid “Nouns” next to a lemma). */
const WORD_CATEGORY_META_LABELS: Record<string, string> = {
  Nouns: "Noun",
  Verbs: "Verb",
  Adjectives: "Adjective",
  Adverbs: "Adverb",
  Places: "Place",
  Phrases: "Phrase",
  Numbers: "Number",
};

/**
 * Right-rail label for a search hit / recent item.
 * Words prefer category (“Noun”) over the generic “Word” kind chip.
 */
export function searchMetaLabel(kind: SearchDocKind, category?: string | null): string {
  if (kind === "word" && category) {
    return WORD_CATEGORY_META_LABELS[category] ?? category;
  }
  return searchKindLabels[kind];
}

export const searchKindChips: SearchDocKind[] = [
  "word",
  "grammar",
  "case",
  "pronunciation",
  "lesson",
  "practice",
];

export function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toLocaleUpperCase("en") + value.slice(1);
}

export const searchIdleHints: Array<{
  category?: string;
  href: string;
  kind: SearchDocKind;
  label: string;
  lang?: string;
}> = [
  {
    label: "ahoj",
    kind: "word",
    category: "Phrases",
    href: "/dictionary/ahoj",
    lang: "sk",
  },
  {
    label: "ďakujem",
    kind: "word",
    category: "Phrases",
    href: "/dictionary/dakujem",
    lang: "sk",
  },
  {
    label: "Nominative",
    kind: "case",
    href: "/grammar/cases/nominative",
  },
  {
    label: "Greetings and introductions",
    kind: "lesson",
    href: "/lessons/everyday/meet-someone",
  },
  {
    label: "First-syllable stress",
    kind: "pronunciation",
    href: "/pronunciation/first-syllable-stress",
  },
];
