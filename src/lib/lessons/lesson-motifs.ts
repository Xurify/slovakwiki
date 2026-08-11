/** Topic motif keys for geometric lesson tiles on `/lessons`. */
export type LessonMotifId =
  | "greetings"
  | "numbers"
  | "time"
  | "negation"
  | "present-tense"
  | "byt"
  | "mat"
  | "stress"
  | "default";

const BY_LESSON_ID: Record<string, LessonMotifId> = {
  "everyday/meet-someone": "greetings",
  "everyday/numbers-and-personal-details": "numbers",
  "everyday/days-dates-and-time": "time",
  "everyday/negation-in-conversation": "negation",
  "grammar/present-tense-i": "present-tense",
  "grammar/byt-present": "byt",
  "grammar/mat-present": "mat",
  "pronunciation/first-syllable-stress": "stress",
};

export function lessonMotifId(lessonId: string): LessonMotifId {
  return BY_LESSON_ID[lessonId] ?? "default";
}
