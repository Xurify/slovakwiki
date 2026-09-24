import type { LessonMotifId } from "../../lesson-story/lesson-motifs";

/** Felt art per grammar topic; topics without their own art share the book. */
const BY_GRAMMAR_SLUG: Record<string, LessonMotifId> = {
  "byt-present": "byt",
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
