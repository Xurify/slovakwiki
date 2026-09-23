const SINGULAR_CATEGORY: Record<string, string> = {
  Adjectives: "Adjective",
  Adverbs: "Adverb",
  Nouns: "Noun",
  Phrases: "Phrase",
  Places: "Place name",
  Verbs: "Verb",
};

/** Browse categories are plural list names; a single entry reads better as “Verb”. */
export function partOfSpeechLabel(category: string): string {
  return SINGULAR_CATEGORY[category] ?? category;
}
