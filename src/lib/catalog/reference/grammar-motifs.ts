import type { LessonMotifId } from "../../lesson-story/lesson-motifs";

/** Felt art per grammar topic; topics without their own art share the book. */
const BY_GRAMMAR_SLUG: Record<string, LessonMotifId> = {
  aspect: "aspect",
  "byt-present": "byt",
  "cases-overview": "cases-overview",
  conditional: "conditional",
  "future-tense": "future-tense",
  "grammatical-gender": "grammatical-gender",
  imperative: "imperative",
  "motion-verbs": "motion-verbs",
  "past-tense": "past-tense",
  possessives: "possessives",
  "reflexive-verbs": "reflexive-verbs",
  "word-order": "word-order",
  demonstratives: "demonstratives",
  "mat-present": "mat",
  negation: "negation",
  "numbers-and-numerals": "numbers",
  "present-tense": "present-tense",
  questions: "questions",
  "telling-time": "time",
  "ty-vs-vy": "greetings",
};

export function grammarMotifId(slug: string): LessonMotifId {
  return BY_GRAMMAR_SLUG[slug] ?? "default";
}
