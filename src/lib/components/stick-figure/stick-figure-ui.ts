import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

/**
 * Sleeves over the ink arm. `reach` runs along the arm: 1 ends at the elbow,
 * 2 at the wrist.
 */
export const STICK_SLEEVES: Partial<
  Record<LessonCharacterId, { class: string; reach: number }>
> = {
  alex: { class: "stroke-blue-600", reach: 1.85 },
  anna: { class: "stroke-rose-500", reach: 1.6 },
  lucia: { class: "stroke-emerald-600", reach: 0.6 },
  marek: { class: "stroke-portrait-vest", reach: 1.85 },
  maria: { class: "stroke-rose-500", reach: 1.85 },
  receptionist: { class: "stroke-blue-600", reach: 1.85 },
  waiter: { class: "stroke-portrait-bib", reach: 1.85 },
};

/** The name on the dialogue box, in the colour the figure wears. */
export const STICK_NAME_CLASSES: Partial<Record<LessonCharacterId, string>> = {
  alex: "text-blue-700",
  anna: "text-rose-700",
  lucia: "text-emerald-700",
  marek: "text-slate-700",
  maria: "text-rose-700",
  receptionist: "text-blue-700",
  waiter: "text-slate-700",
};
