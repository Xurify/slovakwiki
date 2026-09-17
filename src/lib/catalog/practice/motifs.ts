import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";
import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";

const BY_SET_ID: Record<string, LessonMotifId> = {
  "meeting-questions": "questions",
};

export function practiceMotifId(setId: string, lessonId: string): LessonMotifId {
  return BY_SET_ID[setId] ?? lessonMotifId(lessonId);
}

export const practiceMotifRailClass: Record<LessonMotifId, string> = {
  greetings: "bg-blue-50",
  questions: "bg-blue-50",
  numbers: "bg-blue-50",
  time: "bg-blue-50",
  negation: "bg-rose-50",
  "present-tense": "bg-blue-50",
  byt: "bg-blue-50",
  mat: "bg-emerald-50",
  stress: "bg-blue-50",
  default: "bg-blue-50",
};

export function drillLetter(slovak: string): string {
  const letter = [...slovak].find((char) => /\p{L}/u.test(char));
  return letter?.toLocaleUpperCase("sk-SK") ?? "?";
}
