import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";
import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";

const BY_SET_ID: Record<string, LessonMotifId> = {
  "meeting-questions": "questions",
};

export type PracticeGraphicId = LessonMotifId | "phrase-stress";

export function practiceMotifId(setId: string, lessonId: string): LessonMotifId {
  return BY_SET_ID[setId] ?? lessonMotifId(lessonId);
}

export function practiceGraphicId(setId: string, lessonId: string): PracticeGraphicId {
  if (setId === "stress-in-phrases") return "phrase-stress";
  return practiceMotifId(setId, lessonId);
}

export const practiceMotifWellClass: Record<PracticeGraphicId, string> = {
  byt: "bg-blue-100",
  default: "bg-blue-50",
  greetings: "bg-blue-50",
  mat: "bg-emerald-50",
  negation: "bg-rose-50",
  numbers: "bg-blue-800",
  "phrase-stress": "bg-blue-50",
  "present-tense": "bg-blue-50",
  questions: "bg-blue-100",
  stress: "bg-blue-800",
  time: "bg-blue-50",
};

export const practiceFeaturedFieldClass: Record<PracticeGraphicId, string> = {
  byt: "bg-blue-100",
  default: "bg-blue-100",
  greetings: "bg-blue-100",
  mat: "bg-emerald-100",
  negation: "bg-rose-100",
  numbers: "bg-blue-800",
  "phrase-stress": "bg-blue-100",
  "present-tense": "bg-blue-100",
  questions: "bg-blue-100",
  stress: "bg-blue-800",
  time: "bg-blue-100",
};

export function practiceFeaturedOnDark(graphic: PracticeGraphicId): boolean {
  return graphic === "numbers" || graphic === "stress";
}
