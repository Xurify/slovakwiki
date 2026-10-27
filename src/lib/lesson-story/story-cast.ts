/** Client-safe story-stage helpers (no node:crypto). */

import {
  characterIdForSpeaker,
  isLearnerSpeaker,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";

export type StoryCastId = LessonCharacterId;

export type StoryCastSide = "other" | "you" | "narrator";

export interface StoryCastStyle {
  accentClass: string;
  fillClass: string;
  id: StoryCastId;
  inkClass: string;
  side: StoryCastSide;
}

export { isLearnerSpeaker };

const styles: Record<StoryCastId, Omit<StoryCastStyle, "id" | "side">> = {
  alex: {
    fillClass: "fill-emerald-50",
    inkClass: "fill-emerald-700",
    accentClass: "fill-blue-600",
  },
  anna: {
    fillClass: "fill-blue-50",
    inkClass: "fill-blue-800",
    accentClass: "fill-rose-500",
  },
  announcer: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-700",
    accentClass: "fill-blue-600",
  },
  bobik: {
    fillClass: "fill-amber-50",
    inkClass: "fill-amber-900",
    accentClass: "fill-scene-red",
  },
  dog: {
    fillClass: "fill-amber-50",
    inkClass: "fill-amber-900",
    accentClass: "fill-scene-red",
  },
  guide: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-700",
    accentClass: "fill-blue-600",
  },
  lucia: {
    fillClass: "fill-blue-50",
    inkClass: "fill-blue-700",
    accentClass: "fill-emerald-600",
  },
  marek: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-800",
    accentClass: "fill-blue-600",
  },
  maria: {
    fillClass: "fill-rose-50",
    inkClass: "fill-slate-800",
    accentClass: "fill-rose-600",
  },
  narrator: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-600",
    accentClass: "fill-rose-500",
  },
  receptionist: {
    fillClass: "fill-blue-50",
    inkClass: "fill-blue-900",
    accentClass: "fill-blue-600",
  },
  robo: {
    fillClass: "fill-orange-50",
    inkClass: "fill-slate-800",
    accentClass: "fill-orange-500",
  },
  robot: {
    fillClass: "fill-amber-50",
    inkClass: "fill-slate-700",
    accentClass: "fill-amber-500",
  },
  waiter: {
    fillClass: "fill-emerald-50",
    inkClass: "fill-slate-800",
    accentClass: "fill-emerald-600",
  },
};

export function storyCastForId(id: LessonCharacterId): StoryCastStyle {
  const side: StoryCastSide =
    id === "alex" ? "you" : id === "narrator" || id === "guide" ? "narrator" : "other";

  return {
    id,
    side,
    ...styles[id],
  };
}

export function storyCastForSpeaker(speaker: string): StoryCastStyle {
  const id = characterIdForSpeaker(speaker);
  const side: StoryCastSide = isLearnerSpeaker(speaker)
    ? "you"
    : id === "narrator"
      ? "narrator"
      : "other";

  return {
    id,
    side,
    ...styles[id],
  };
}
