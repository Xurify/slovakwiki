import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

/** Torso stroke: the shirt colour each portrait wears in LessonCharacterAvatar. */
export const STICK_SHIRT_CLASS: Record<LessonCharacterId, string> = {
  alex: "stroke-blue-600",
  anna: "stroke-rose-500",
  guide: "stroke-blue-600",
  lucia: "stroke-emerald-600",
  marek: "stroke-slate-800",
  maria: "stroke-rose-500",
  narrator: "stroke-rose-500",
  receptionist: "stroke-blue-600",
  waiter: "stroke-slate-800",
};

/**
 * Sleeves over the ink arm. `reach` runs along the arm: 1 ends at the elbow,
 * 2 at the wrist.
 */
export const STICK_SLEEVES: Partial<
  Record<LessonCharacterId, { class: string; reach: number }>
> = {
  receptionist: { class: "stroke-blue-600", reach: 1.85 },
  waiter: { class: "stroke-portrait-bib", reach: 1.85 },
  lucia: { class: "stroke-emerald-600", reach: 0.6 },
};
