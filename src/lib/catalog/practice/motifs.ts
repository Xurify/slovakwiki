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
